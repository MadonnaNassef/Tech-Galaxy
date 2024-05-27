const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			trim: true,
			required: [true, 'Coupon name is required'],
			uppercase: true,
		},
		expire: {
			type: Date,
			required: [true, 'Expiry date is required'],
		},
		discount: {
			type: Number,
			required: [true, 'Coupon discount value is required'],
		},
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
	},
	{ timestamps: true }
);

const CouponModel = mongoose.model('Coupon', couponSchema);

module.exports = CouponModel;
