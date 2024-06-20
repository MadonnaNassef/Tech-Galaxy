const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		cartItems: [
			{
				product: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'Product',
				},
				quantity: Number,
				price: Number,
				color: String,
			},
		],
		taxPrice: {
			type: Number,
			default: 0,
		},
		shippingPrice: {
			type: Number,
			default: 0,
		},
		shippingAddress: {
			alis: { type: String, enum: ['Home', 'Work', 'Other'] },
			street: String,
			governorate: String,
			apartmentNumber: Number,
			floor: Number,
			phoneNumber: String,
			additionalDescription: String,
		},
		totalOrderPrice: Number,
		paymentType: { type: String, enum: ['cash', 'card'], default: 'cash' },
		isPaid: { type: Boolean, default: false },
		paidAt: Date,
		isDelivered: { type: Boolean, default: false },
		deliveredAt: Date,
	},
	{ timestamps: true }
);

// Mongoose Middleware
orderSchema.pre(/^find/, function (next) {
	this.populate({ path: 'user', select: 'name email phone' }).populate({
		path: 'cartItems.product',
		select: 'title colors coverImage price',
	});
	next();
});

const orderModel = mongoose.model('Order', orderSchema);

module.exports = orderModel;
