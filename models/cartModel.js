const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
	{
		cartItems: [
			{
				product: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'Product',
				},
				quantity: { type: Number, default: 1 },
				price: Number,
				color: String,
			},
		],
		totalCartPrice: Number,
		totalAfterDiscount: Number,
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
	},
	{ timestamps: true }
);

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
