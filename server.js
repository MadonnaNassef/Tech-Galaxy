const express = require('express');

const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');

dotenv.config({ path: 'config.env' });
const ApiError = require('./utils/apiError');
const globalError = require('./middlewares/errorMiddleware');
const dbConnection = require('./config/database');

const categoryRoute = require('./routes/categoryRoute');
const subCategoryRoute = require('./routes/subCategoryRoute');
const brandRoute = require('./routes/brandRoute');
const productRoute = require('./routes/productRoute');
const userRoute = require('./routes/userRoute');
const authRoute = require('./routes/authRoute');

// Connect to db
dbConnection();

// Express app
const app = express();

// Middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, 'uploads')));

if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
	console.log(`mode: ${process.env.NODE_ENV}`);
}

// Mount Routes
app.use('/api/categories', categoryRoute);
app.use('/api/subcategory', subCategoryRoute);
app.use('/api/brands', brandRoute);
app.use('/api/product', productRoute);
app.use('/api/users', userRoute);
app.use('/api/users/auth', authRoute);

app.all('*', (req, res, next) => {
	next(new ApiError(`Page not found 404 : ${req.originalUrl}`, 400));
});

// Global error handling middleware (for express)
app.use(globalError);

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
	console.log(`App running on port ${PORT}`);
});

// Events error handling (outside express)
process.on('unhandledRejection', (err) => {
	console.error(`Unhandled error: ${err.name} | ${err.message}`);
	server.close(() => {
		console.error('Shutting down website');
		process.exit(1);
	});
});
