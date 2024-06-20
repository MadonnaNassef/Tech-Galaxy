const mongoose = require('mongoose');

// expiress after a month of creation date
const calculateExpiryDate = () => {
	const currentDate = new Date();
	// Add one month to the current date
	const expiryDate = new Date(
		currentDate.getFullYear(),
		currentDate.getMonth() + 1,
		currentDate.getDate()
	);
	return expiryDate;
};

const expiry = calculateExpiryDate();

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
			default: expiry,
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
