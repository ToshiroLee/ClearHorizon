require('dotenv').config();
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const xlsx = require('xlsx'); // Add this line
const multer = require('multer'); // Add multer for file uploads
const path = require('path'); // Add path for file extensions
const app = express();

const authController = require('./controllers/authController');
const productController = require('./controllers/productController');
const inventoryController = require('./controllers/inventoryController');
const shoppingController = require('./controllers/shoppingController');

const connection = require('./controllers/db'); // Assuming you have a db.js file for MySQL connection

// Set up view engine
app.set('view engine', 'ejs');
// Enable static files
app.use(express.static('public'));
// Enable form processing
app.use(express.urlencoded({ extended: false }));

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/') // Store files in public/images directory
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // Generate unique filename
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        // Only allow image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    },
    limits: {
        fileSize: process.env.MAX_FILE_SIZE || 5 * 1024 * 1024 // 5MB default
    }
});

// Session Middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 }
}));

app.use(flash());

// Middleware to check if user is logged in
const checkAuthenticated = (req, res, next) => {
    if (req.session.user) {
        console.log('User is authenticated:', req.session.user);
        return next();
    } else {
        console.log('User is not authenticated');
        req.flash('error', 'Please log in to view this page');
        res.redirect('/login');
    }
};

//Middleware to check if user is admin
const checkAdmin = (req, res, next) => {
    if (req.session.user.role === 'admin') {
        console.log('User is admin:', req.session.user);
        return next();
    } else {
        console.log('User is not admin');
        req.flash('error', 'Access denied');
        res.redirect('/login');
    }
};

app.get('/', (req, res) => {
    res.render('index', { user: req.session.user });
});

// Auth routes
app.get('/register', (req, res) => {
    res.render('register', { messages: req.flash('error'), formData: req.flash('formData')[0] });
});
app.post('/register', authController.validateRegistration, authController.register);
app.get('/login', (req, res) => {
    res.render('login', { messages: req.flash('success'), errors: req.flash('error') });
});
app.post('/login', authController.login);
app.get('/logout', authController.logout);

// Trend routes
app.get('/trend/:id', checkAuthenticated, productController.getTrend);
app.get('/trend', checkAuthenticated, checkAdmin, (req, res) => {
    res.render('addTrend', { user: req.session.user });
});
app.post('/trend', productController.addTrend);
app.get('/trend/:id/update', (req, res) => {
    const trendId = req.params.id;
    connection.query('SELECT * FROM trends WHERE trendId = ?', [trendId], (error, results) => {
        if (error) throw error;
        if (results.length > 0) {
            res.render('updateTrend', { trend: results[0] });
        } else {
            res.status(404).send('Trend not found');
        }
    });
});
app.post('/trend/:id/update', upload.single('image'), productController.updateTrend);
app.get('/trend/:id/delete', productController.deleteTrend);


// Inventory routes
app.get('/inventory', checkAuthenticated, checkAdmin, inventoryController.getAllTrends);
app.get('/inventory/stocks', checkAuthenticated, checkAdmin, inventoryController.getStocks);
app.get('/inventory/crypto', checkAuthenticated, checkAdmin, inventoryController.getCrypto);

// Shopping routes
app.get('/shopping', checkAuthenticated, shoppingController.getAllTrends);
app.get('/shopping/stocks', checkAuthenticated, shoppingController.getStocks);
app.get('/shopping/crypto', checkAuthenticated, shoppingController.getCrypto);

// User management routes (Admin only)
app.get('/users', checkAuthenticated, checkAdmin, authController.getAllUsers);
app.get('/users/add', checkAuthenticated, checkAdmin, (req, res) => {
    res.render('register', { messages: req.flash('error'), formData: req.flash('formData')[0], user: req.session.user });
});
app.get('/editUser/:id', checkAuthenticated, checkAdmin, authController.getEditUser);
app.post('/editUser/:id', checkAuthenticated, checkAdmin, authController.updateUser);
app.post('/deleteUser/:id', checkAuthenticated, checkAdmin, authController.deleteUser);

// Route to generate sales report
app.get('/generate-sales-report', checkAuthenticated, checkAdmin, (req, res) => {
    connection.query('SELECT * FROM sales', (error, results) => {
        if (error) {
            console.error('Database error:', error);
            return res.status(500).send('Internal Server Error');
        }

        console.log('Sales data fetched:', results); // Log the fetched data

        if (results.length === 0) {
            console.log('No sales data found');
            return res.status(404).send('No sales data found');
        }

        try {
            // Create a new workbook and worksheet
            const workbook = xlsx.utils.book_new();
            const worksheet = xlsx.utils.json_to_sheet(results);

            // Append the worksheet to the workbook
            xlsx.utils.book_append_sheet(workbook, worksheet, 'Sales Report');

            // Write the workbook to a buffer
            const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

            // Set the response headers and send the buffer
            res.setHeader('Content-Disposition', 'attachment; filename=sales_report.xlsx');
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.send(buffer);
        } catch (err) {
            console.error('Error generating Excel file:', err);
            res.status(500).send('Internal Server Error');
        }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));