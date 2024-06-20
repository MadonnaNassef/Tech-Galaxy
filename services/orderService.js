const asyncHandler = require('express-async-handler');
const factory = require('./handlersFactory');
const ApiError = require('../utils/apiError');
const stripe = require('stripe')(process.env.STRIPE_SECRET);

const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const Product = require('../models/productsModel');
const User = require('../models/userModel');

// Create cash order
// POST /api/orders/:cartId
// Private User
exports.createCashOrder = asyncHandler(async (req, res, next) => {
	// app setting
	const taxPrice = 0;
	const shippingPrice = 0;

	const cart = await Cart.findById(req.params.cartId);
	if (!cart) {
		return next(new ApiError('Cart is empty', 404));
	}
	const cartPrice = cart.totalAfterDiscount
		? cart.totalAfterDiscount
		: cart.totalCartPrice;

	const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

	const order = await Order.create({
		user: req.user._id,
		cartItems: cart.cartItems,
		shippingAddress: req.body.shippingAddress,
		totalOrderPrice: totalOrderPrice,
	});

	if (order) {
		const bulkOption = cart.cartItems.map((item) => ({
			updateOne: {
				filter: { _id: item.product },
				update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
			},
		}));

		await Product.bulkWrite(bulkOption, {});
	}

	await Cart.findByIdAndDelete(req.params.cartId);

	res.status(201).json({ status: 'success', data: order });
});

exports.filterOrdersForUser = asyncHandler(async (req, res, next) => {
	if (req.user.role === 'user') {
		req.filterObject = { user: req.user._id };
	}
	next();
});

// Get all orders
// POST /api/orders
// Private User - admin - manager
exports.getAllOrders = factory.getDocuments(Order);

// Get specific order
// POST /api/order/:id
// Private User - admin - manager
exports.getSpecificOrder = factory.getSpecificDoc(Order);

// Update order paid status
// PUT /api/order/:id
// Private admin - manager
exports.updateStatus = asyncHandler(async (req, res, next) => {
	const order = await Order.findById(req.params.id);
	if (!order) return next(new ApiError('Order not found', 404));

	order.isPaid = true;
	order.paidAt = Date.now();

	const updatedOrder = await order.save();

	res.status(200).json({ status: 'success', data: updatedOrder });
});

// Update order delivered status
// PUT /api/order/:id
// Private admin - manager
exports.updateDeliveryStatus = asyncHandler(async (req, res, next) => {
	const order = await Order.findById(req.params.id);
	if (!order) return next(new ApiError('Order not found', 404));

	order.isDelivered = true;
	order.deliveredAt = Date.now();

	const updatedOrder = await order.save();

	res.status(200).json({ status: 'success', data: updatedOrder });
});

// Create checkout session from stripe and send as a response
// GET /api/orders/checkout-session/:cartid
// Private User
exports.createCheckoutSession = asyncHandler(async (req, res, next) => {
	const taxPrice = 0;
	const shippingPrice = 0;

	const cart = await Cart.findById(req.params.cartId);
	if (!cart) {
		return next(new ApiError('Cart is empty', 404));
	}
	const cartPrice = cart.totalAfterDiscount
		? cart.totalAfterDiscount
		: cart.totalCartPrice;

	const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

	const session = await stripe.checkout.sessions.create({
		payment_method_types: ['card'],
		line_items: [
			{
				price_data: {
					currency: 'egp',
					product_data: {
						name: 'Total Order',
						description: `Order placed by ${req.user.name}`,
					},
					unit_amount: totalOrderPrice * 100,
				},
				quantity: 1,
			},
		],
		mode: 'payment',
		client_reference_id: req.params.cartId.toString(),
		customer_email: req.user.email,
		success_url: `${req.protocol}://${req.get('host')}/success.html`,
		cancel_url: `${req.protocol}://${req.get('host')}/checkout.html`,
		metadata: {
			shippingAddress: JSON.stringify(req.body.shippingAddress),
		},
	});

	res.status(200).json({ status: 'success', session });
});

const createCardOrder = async (session) => {
	const cartId = session.client_reference_id;
	const shippingAddress = session.metadata;
	const oderPrice = session.amount_total / 100;

	const cart = await Cart.findById(cartId);
	const user = await User.findOne({ email: session.customer_email });

	// 3) Create order with default paymentMethodType card
	const order = await Order.create({
		user: user._id,
		cartItems: cart.cartItems,
		shippingAddress,
		totalOrderPrice: oderPrice,
		isPaid: true,
		paidAt: Date.now(),
		paymentMethodType: 'card',
	});

	// 4) After creating order, decrement product quantity, increment product sold
	if (order) {
		const bulkOption = cart.cartItems.map((item) => ({
			updateOne: {
				filter: { _id: item.product },
				update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
			},
		}));
		await Product.bulkWrite(bulkOption, {});

		// 5) Clear cart depend on cartId
		await Cart.findByIdAndDelete(cartId);
	}
};

exports.webhookCheckout = asyncHandler(async (req, res) => {
	const sig = req.headers['stripe-signature'];

	// This is your Stripe CLI webhook secret for testing your endpoint locally.
	let event;

	try {
		event = stripe.webhooks.constructEvent(
			req.body,
			sig,
			process.env.endpointSecret
		);
	} catch (err) {
		res.status(400).send(`Webhook Error: ${err.message}`);
		return;
	}

	// Handle the event
	switch (event.type) {
		case 'checkout.session.completed':
			console.log('create order here');
			// eslint-disable-next-line no-case-declarations, no-unused-vars
			const checkoutSessionCompleted = event.data.object;
			// Then define and call a function to handle the event checkout.session.completed
			//  Create order
			createCardOrder(event.data.object);

			break;
		// ... handle other event types
		default:
			console.log(`Unhandled event type ${event.type}`);
	}

	// // Return a 200 response to acknowledge receipt of the event
	res.status(200).json({ success: true });
});
