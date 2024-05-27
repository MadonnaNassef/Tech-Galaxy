const express = require('express');

const router = express.Router({ mergeParams: true });

const {
	getCoupon,
	getCoupons,
	createCoupon,
	updateCoupon,
	deleteCoupon,
	autoGenerateCoupon,
} = require('../services/couponService');

const { authenticated, authorized } = require('../services/authService');

const {
	getCouponsValidator,
	createCouponValidator,
	updateCouponValidator,
	deleteCouponValidator,
	getCouponValidator,
} = require('../utils/validators/couponValidators');

router.route('/').get(getCouponsValidator, getCoupons);

router.route('/').post(createCouponValidator, autoGenerateCoupon);

router.use(authenticated, authorized('admin', 'manager'));
router.route('/').post(createCouponValidator, createCoupon);
router
	.route('/:id')
	.get(getCouponValidator, getCoupon)
	.put(updateCouponValidator, updateCoupon)
	.delete(deleteCouponValidator, deleteCoupon);

module.exports = router;
