const { check, body } = require('express-validator');
const validorMiddleware = require('../../middlewares/validatorMiddleware');
const User = require('../../models/userModel');

exports.getCouponValidator = [
	check('id').isMongoId().withMessage('Invalid Review ID format'),
	validorMiddleware,
];

exports.getCouponsValidator = [
	check('userId').optional().isMongoId().withMessage('Invalid user ID format'),
	async (req, res, next) => {
		const { userId } = req.params;
		if (!userId) {
			// If userId is not provided, move to the next middleware
			return next();
		}

		try {
			const user = await User.findById(userId).populate('coupons');
			if (!user) {
				return res.status(404).json({ message: 'User not found' });
			}
			req.user = user; // Attach user object to request for later use
			next();
		} catch (error) {
			console.error('Error fetching user:', error);
			return res.status(500).json({ message: 'Internal server error' });
		}
	},
	validorMiddleware,
];

exports.createCouponValidator = [
	check('name').notEmpty().withMessage('Coupon name is required'),
	check('expire').notEmpty().withMessage('Expiry date required'),
	check('discount').notEmpty().withMessage('Discount value required'),
	check('user').notEmpty().withMessage('Coupon must belong to a user'),

	validorMiddleware,
];

exports.updateCouponValidator = [
	check('id').isMongoId().withMessage('Invalid Coupon ID format'),
	body('name').optional(),
	body('expire').optional(),
	body('discount').optional(),
	validorMiddleware,
];

exports.deleteCouponValidator = [
	check('id').isMongoId().withMessage('Invalid Coupon ID format'),
	validorMiddleware,
];
