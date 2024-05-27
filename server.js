const express = require('express');

const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');

dotenv.config({ path: 'config.env' });
const ApiError = require('./utils/apiError');
const globalError = require('./middlewares/errorMiddleware');
const dbConnection = require('./config/database');

// Routes
const mountRoutes = require('./routes');

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
mountRoutes(app);

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
