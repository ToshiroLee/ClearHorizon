# ClearHorizon Store

A comprehensive e-commerce web application built with Node.js, Express, and MySQL for managing products, users, and inventory.

## Features

- **User Management**: Registration, login, role-based access (Admin/User)
- **Product Management**: Add, edit, delete products with image uploads
- **Inventory System**: Track and manage stock levels
- **Admin Dashboard**: Complete administrative controls
- **User Authentication**: Secure session-based authentication
- **Responsive Design**: Bootstrap-based responsive UI
- **Sales Reporting**: Generate and download sales reports

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Frontend**: EJS templating, Bootstrap 5
- **Authentication**: Express-session
- **File Upload**: Multer
- **Environment**: dotenv

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ClearHorizon
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Update the values in `.env` with your configuration:
   ```bash
   cp .env.example .env
   ```

4. **Database Setup**
   - Create a MySQL database named `clearhorizon`
   - Create required tables:
   ```sql
   CREATE TABLE users (
     id INT AUTO_INCREMENT PRIMARY KEY,
     username VARCHAR(20) NOT NULL,
     email VARCHAR(255) NOT NULL,
     password VARCHAR(255) NOT NULL,
     address VARCHAR(255) NOT NULL,
     contact VARCHAR(10) NOT NULL,
     role VARCHAR(10) NOT NULL
   );
   
   CREATE TABLE trends (
     trendId INT AUTO_INCREMENT PRIMARY KEY,
     trendName VARCHAR(255) NOT NULL,
     category VARCHAR(255) NOT NULL,
     description TEXT,
     image VARCHAR(255)
   );
   
   CREATE TABLE sales (
     id INT AUTO_INCREMENT PRIMARY KEY,
     -- Add your sales table columns here
   );
   ```

5. **Run the application**
   ```bash
   npm start
   # or for development
   node app.js
   ```

6. **Access the application**
   - Open your browser and go to `http://localhost:3000`

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_database_password
DB_NAME=clearhorizon
DB_PORT=3306

# Server Configuration
PORT=3000

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# File Upload Configuration
MAX_FILE_SIZE=5242880

# Environment
NODE_ENV=development
```

## Usage

### Admin Features
- Access admin dashboard at `/inventory`
- Manage users through Users dropdown menu
- Add/edit/delete products
- Generate sales reports

### User Features
- Register and login
- Browse products
- View product details

## Project Structure

```
ClearHorizon/
├── controllers/
│   ├── authController.js      # User authentication logic
│   ├── db.js                  # Database connection
│   ├── inventoryController.js # Inventory management
│   ├── productController.js   # Product management
│   └── shoppingController.js  # Shopping features
├── public/
│   ├── images/               # Uploaded images
│   └── js/                   # Client-side JavaScript
├── views/
│   ├── partials/
│   │   └── navbar.ejs        # Navigation component
│   ├── *.ejs                 # EJS templates
├── .env                      # Environment variables (not in repo)
├── .env.example             # Environment template
├── .gitignore               # Git ignore rules
├── app.js                   # Main application file
└── package.json            # Project dependencies
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Security Notes

- Never commit your `.env` file
- Use strong session secrets in production
- Regularly update dependencies
- Implement proper input validation
- Use HTTPS in production

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email your-email@example.com or create an issue in the repository.