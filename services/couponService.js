const Coupon = require('../models/couponModel');
const factory = require('./handlersFactory');
const User = require('../models/userModel');

// Create Coupon
// Post method, /api/Coupons
// Private access/ admin-manager
exports.createCoupon = factory.create(Coupon);

// Update getCoupon
// PUT /api/coupons/:id
// Private/  admin-manager
exports.updateCoupon = factory.update(Coupon);

// Delete Coupon
// Delete /api/coupons/:id
// Private /  admin-manager
exports.deleteCoupon = factory.delete(Coupon);

// Get Coupons
// Get /api/coupons
// Private /  admin-manager
exports.getCoupons = factory.getDocuments(Coupon);

// Get specific getCoupon by id
// GET /api/coupons/:id
// Private / admin-manager

exports.getCoupon = factory.getSpecificDoc(Coupon);

// auto generate Coupon
exports.autoGenerateCoupon = async function generateCoupon(
	user,
	discount,
	expiry
) {
	const coupon = new Coupon({
		name: '10% off for your review, thank you!',
		discount: discount,
		expire: expiry,
		user: user._id,
	});
	const userWithDiscount = await User.findById(user._id);
	await coupon.save();
	userWithDiscount.coupons.push(coupon);

	await userWithDiscount.save();
};
