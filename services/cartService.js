const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');

const Cart = require('../models/cartModel');
const Product = require('../models/productsModel');
const Coupon = require('../models/couponModel');

const calcTotalCartPrice = (cart) => {
	let totalPrice = 0;
	cart.cartItems.forEach((productItem) => {
		totalPrice += productItem.quantity * productItem.price;
	});
	cart.totalAfterDiscount = undefined;
	return totalPrice;
};

// Add product to cart
// POST /api/cart
// Private/User
exports.addProductToCart = asyncHandler(async (req, res, next) => {
	const { productId, color, quantity } = req.body;
	const product = await Product.findById(productId);
	let cart = await Cart.findOne({ user: req.user._id });
	if (!cart) {
		cart = await Cart.create({
			user: req.user._id,
			cartItems: [
				{
					product: productId,
					color,
					quantity,
					price: product.price,
				},
			],
		});
	} else {
		const productIndex = cart.cartItems.findIndex(
			(item) => item.product.toString() === productId && item.color === color
		);

		// Product exits, update quantity
		if (productIndex > -1) {
			const cartItem = cart.cartItems[productIndex];
			if (quantity) {
				cartItem.quantity += quantity;
			} else cartItem.quantity += 1;

			cart.cartItems[productIndex] = cartItem;
		} else {
			// Product doesn't exist, Push product
			cart.cartItems.push({
				product: productId,
				color,
				quantity,
				price: product.price,
			});
		}

		const totalPrice = calcTotalCartPrice(cart);

		cart.totalCartPrice = totalPrice;
		await cart.save();

		res.status(200).json({
			message: 'Product added to cart successfully',
			numberOfCartItems: cart.cartItems.length,
			data: cart,
		});
	}
});

// Get user cart
// GET /api/cart
// Private/User
exports.getLoggedCart = asyncHandler(async (req, res, next) => {
	const cart = await Cart.findOne({ user: req.user._id });
	if (!cart) {
		return next(new ApiError('Cart is empty', 404));
	}

	res.status(200).json({
		status: 'Success',
		numberOfCartItems: cart.cartItems.length,
		data: cart,
	});
});

// Delete product from cart
// Delete /api/cart/:itemId
// Private/User
exports.deleteProductFromCart = asyncHandler(async (req, res, next) => {
	const cart = await Cart.findOneAndUpdate(
		{ user: req.user._id },
		{
			$pull: { cartItems: { _id: req.params.itemId } },
		},
		{ new: true }
	);

	const totalPrice = calcTotalCartPrice(cart);

	cart.totalCartPrice = totalPrice;
	await cart.save();

	res.status(200).json({
		status: 'Success',
		numberOfCartItems: cart.cartItems.length,
		data: cart,
	});
});

// Clear cart
// Delete /api/cart
// Private/User
exports.clearCart = asyncHandler(async (req, res, next) => {
	await Cart.findOneAndDelete({ user: req.user._id });

	res.status(204).send();
});

// Update product quantity in cart
// PUT /api/cart/:itemId
// Private/User
exports.editQuantityInCart = asyncHandler(async (req, res, next) => {
	const { quantity } = req.body;

	const cart = await Cart.findOne({ user: req.user._id });

	if (!cart) {
		return next(new ApiError('No cart found for this user', 404));
	}

	const itemIndex = cart.cartItems.findIndex(
		(item) => item._id.toString() === req.params.itemId
	);

	if (itemIndex > -1) {
		const cartItem = cart.cartItems[itemIndex];
		cartItem.quantity = quantity;
		cart.cartItems[itemIndex] = cartItem;
	} else {
		return next(new ApiError('No Item for this ID', 404));
	}

	const totalPrice = calcTotalCartPrice(cart);

	cart.totalCartPrice = totalPrice;
	await cart.save();

	res.status(200).json({
		status: 'Success',
		numberOfCartItems: cart.cartItems.length,
		data: cart,
	});
});

// Update price after dicount in cart (Apply coupon)
// PUT /api/cart/applyCoupon
// Private/User
exports.applyCoupon = asyncHandler(async (req, res, next) => {
	const coupon = await Coupon.findOne({
		name: req.body.coupon,
		expire: { $gt: Date.now() },
	});
	if (!coupon) {
		return next(new ApiError('Invalid Voucher'));
	}
	const cart = await Cart.findOne({ user: req.user._id });

	const totalPrice = cart.totalCartPrice;

	const totalPriceAterDiscount =
		totalPrice - ((totalPrice * coupon.discount) / 100).toFixed(2);

	cart.totalAfterDiscount = totalPriceAterDiscount;
	await cart.save();

	res.status(200).json({
		status: 'Success',
		numberOfCartItems: cart.cartItems.length,
		data: cart,
	});
});
