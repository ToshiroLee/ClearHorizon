const pool = require('../controllers/db'); // Use connection pool for better performance

const validateRegistration = (req, res, next) => {
    const { username, email, password, address, contact, role } = req.body;

    if (!username || !email || !password || !address || !contact || !role) {
        return res.status(400).send('All fields are required.');
    }
    
    if (password.length < 6) {
        req.flash('error', 'Password should be at least 6 or more characters long');
        req.flash('formData', req.body);
        return res.redirect('/register');
    }
    next();
};

const register = (req, res) => {
    const { username, email, password, address, contact, role } = req.body;

    const sql = 'INSERT INTO users (username, email, password, address, contact, role) VALUES (?, ?, SHA1(?), ?, ?, ?)';
    pool.query(sql, [username, email, password, address, contact, role], (err, result) => {
        if (err) {
            console.error('Registration error:', err);
            req.flash('error', 'Registration failed. Please try again.');
            return res.redirect('/register');
        }
        console.log(result);
        req.flash('success', 'Registration successful! Please log in.');
        res.redirect('/login');
    });
};

const login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        req.flash('error', 'Please enter email and password');
        return res.redirect('/login');
    }

    const sql = 'SELECT * FROM users WHERE email = ? AND password = SHA1(?)';
    pool.query(sql, [email, password], (err, results) => { 
        if (err) {
            console.error('Login error:', err);
            req.flash('error', 'Login failed. Please try again.');
            return res.redirect('/login');
        }
        if (results.length > 0) {
            req.session.user = results[0];
            req.flash('success', 'Login successful');
            if (req.session.user.role === 'admin') {
                res.redirect('/inventory');
            } else {
                res.redirect('/shopping');
            }
        } else {
            req.flash('error', 'Invalid email or password');
            res.redirect('/login');
        }
    });
};

const logout = (req, res) => {
    req.session.destroy();
    res.redirect('/');
};

// Get all users for management page
const getAllUsers = (req, res) => {
    const sql = 'SELECT id AS userId, username, email, role AS userRole FROM users ORDER BY username';
    pool.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching users:', err);
            req.flash('error', 'Failed to load users');
            return res.redirect('/inventory');
        }
        console.log('Users fetched:', results);
        res.render('users', { users: results, user: req.session.user });
    });
};

// Get single user for editing
const getEditUser = (req, res) => {
    const userId = req.params.id;
    const sql = 'SELECT id AS userId, username, email, role FROM users WHERE id = ?';
    pool.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching user:', err);
            req.flash('error', 'User not found');
            return res.redirect('/users');
        }
        if (results.length > 0) {
            res.render('edituser', { user: results[0], currentUser: req.session.user });
        } else {
            req.flash('error', 'User not found');
            res.redirect('/users');
        }
    });
};

// Update user
const updateUser = (req, res) => {
    const userId = req.params.id;
    const { userName, userEmail, userRole } = req.body;
    
    const sql = 'UPDATE users SET username = ?, email = ?, role = ? WHERE id = ?';
    pool.query(sql, [userName, userEmail, userRole, userId], (err, result) => {
        if (err) {
            console.error('Error updating user:', err);
            req.flash('error', 'Failed to update user');
            return res.redirect('/editUser/' + userId);
        }
        req.flash('success', 'User updated successfully');
        res.redirect('/users');
    });
};

// Delete user
const deleteUser = (req, res) => {
    const userId = req.params.id;
    
    // Prevent admin from deleting themselves
    if (userId == req.session.user.id) {
        req.flash('error', 'You cannot delete your own account');
        return res.redirect('/users');
    }
    
    const sql = 'DELETE FROM users WHERE id = ?';
    pool.query(sql, [userId], (err, result) => {
        if (err) {
            console.error('Error deleting user:', err);
            req.flash('error', 'Failed to delete user');
            return res.redirect('/users');
        }
        req.flash('success', 'User deleted successfully');
        res.redirect('/users');
    });
};

module.exports = {
    validateRegistration,
    register,
    login,
    logout,
    getAllUsers,
    getEditUser,
    updateUser,
    deleteUser
};