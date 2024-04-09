const { check, body } = require('express-validator');
const validorMiddleware = require('../../middlewares/validatorMiddleware');
const { default: slugify } = require('slugify');
const User = require('../../models/userModel');
// const bcrypt = require('bcryptjs');

exports.regiterValidator = [
	check('name')
		.notEmpty()
		.withMessage('Username required')
		.isLength({ min: 3 })
		.withMessage('Username is too short')
		.custom((val, { req }) => {
			req.body.slug = slugify(val);
			return true;
		}),

	check('email')
		.notEmpty()
		.withMessage('Email is required')
		.isEmail()
		.withMessage('Invalid Email')
		.custom(async (value) => {
			const user = await User.findOne({ email: value });
			if (user) {
				throw new Error('Email already used');
			}
		}),

	check('phone')
		.notEmpty()
		.withMessage('Phone number is required')
		.isMobilePhone('ar-EG')
		.withMessage('Invalid Egyptian phone number'),

	check('password')
		.notEmpty()
		.withMessage('Password is required')
		.isLength({ min: 8 })
		.withMessage('Password must be at least 8 characters')
		.custom((password, { req }) => {
			if (password !== req.body.confirmPassword) {
				throw new Error(`Password doesn't match`);
			}
			return true;
		}),

	check('confirmPassword')
		.notEmpty()
		.withMessage('Confirm password is required'),

	validorMiddleware,
];

exports.loginValidtor = [
	body('email')
		.notEmpty()
		.withMessage('Email is required')
		.isEmail()
		.withMessage('Invalid Email'),
	body('password')
		.notEmpty()
		.withMessage('Password is required')
		.isLength({ min: 8 })
		.withMessage('Password must be at least 8 characters'),
	validorMiddleware,
];

exports.resetPasswordValidator = [
	body('email')
		.notEmpty()
		.withMessage('Must enter an email')
		.isEmail()
		.withMessage('Invalid Email'),
	check('password')
		.notEmpty()
		.withMessage('New password is required')
		.isLength({ min: 8 })
		.withMessage('Password must be at least 8 characters')
		.custom(async (password, { req }) => {
			if (password !== req.body.confirmPassword) {
				throw new Error(`Password doesn't match`);
			}
			return true;
		}),
	check('confirmPassword').notEmpty().withMessage('Must confirm password'),
	validorMiddleware,
];

// exports.changeUserPasswordValidator = [
// 	check('id').isMongoId().withMessage('Invalid User ID format'),
// 	body('currentPassword').notEmpty().withMessage('Must enter current password'),
// 	check('password')
// 		.notEmpty()
// 		.withMessage('Password is required')
// 		.isLength({ min: 8 })
// 		.withMessage('Password must be at least 8 characters')
// 		.custom(async (password, { req }) => {
// 			const user = await User.findById(req.params.id);
// 			if (!user) {
// 				throw new Error(`User not found`);
// 			}
// 			const isCorrect = await bcrypt.compare(
// 				req.body.currentPassword,
// 				user.password
// 			);
// 			if (!isCorrect) {
// 				throw new Error(`Incorrect current password`);
// 			}
// 			if (password !== req.body.confirmPassword) {
// 				throw new Error(`Password doesn't match`);
// 			}
// 			return true;
// 		}),
// 	check('confirmPassword').notEmpty().withMessage('Must confirm password'),
// 	validorMiddleware,
// ];
