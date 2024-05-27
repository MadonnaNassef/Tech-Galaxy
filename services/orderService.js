const asyncHandler = require('express-async-handler');
const factory = require('./handlersFactory');
const ApiError = require('../utils/apiError');

const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const Product = require('../models/productsModel');

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
