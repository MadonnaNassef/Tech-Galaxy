/* eslint-disable no-unused-vars */
const express = require('express');

const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET);
const bodyparser = require('body-parser');

dotenv.config({ path: 'config.env' });
const ApiError = require('./utils/apiError');
const globalError = require('./middlewares/errorMiddleware');
const dbConnection = require('./config/database');

// Routes
const mountRoutes = require('./routes');
const { webhookCheckout } = require('./services/orderService');

// Connect to db
dbConnection();

// Express app
const app = express();

// cors
app.use(cors());
app.options('*', cors());

// Serve static files *Images*
app.use('/product', express.static('uploads/products'));
app.use('/brands', express.static('uploads/brands'));
// app.use('/product/:id', express.static('uploads/products'));
app.use('/cart', express.static('uploads/products'));

//webhook
// app.post(
// 	'/webhook',
// 	express.raw({ type: 'application/json' }),
// 	async (req, res) => {
// 		const sig = req.headers['stripe-signature'];

// 		let event;

// 		try {
// 			event = stripe.webhooks.constructEvent(
// 				req.body,
// 				sig,
// 				process.env.endpointSecret
// 			);
// 		} catch (err) {
// 			res.status(400).send(`Webhook Error: ${err.message}`);
// 			return;
// 		}

// 		// successfull
// 		console.log(event.type);
// 		console.log(event.data.object);
// 		console.log(event.data.object.id);

// 		// // Handle the event
// 		// switch (event.type) {
// 		// 	case 'payment_intent.succeeded':
// 		// 		// eslint-disable-next-line no-case-declarations
// 		// 		const paymentIntentSucceeded = event.data.object;
// 		// 		// Then define and call a function to handle the event payment_intent.succeeded
// 		// 		break;
// 		// 	// ... handle other event types
// 		// 	default:
// 		// 		console.log(`Unhandled event type ${event.type}`);
// 		// }

// 		// // Return a 200 response to acknowledge receipt of the event
// 		res.json({ success: true });
// 	}
// );

//checkout webhook
app.post(
	'/webhook-checkout',
	express.raw({ type: 'application/json' }),
	webhookCheckout
);

// Server static files to get front-end
app.use(express.static(path.join(__dirname, '..', 'TechGalaxy-frontend')));

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '..', 'TechGalaxy-frontend', 'home.html'));
});

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
