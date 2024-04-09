const { check, body } = require('express-validator');
const validorMiddleware = require('../../middlewares/validatorMiddleware');
const { default: slugify } = require('slugify');

exports.getBrandValidator = [
	check('id').isMongoId().withMessage('Invalid Brand ID format'),
	validorMiddleware,
];

exports.createBrandValidator = [
	check('name')
		.notEmpty()
		.withMessage('Brand required')
		.isLength({ min: 3 })
		.withMessage('Brand name is too short')
		.isLength({ max: 32 })
		.withMessage('Brand name is too long')
		.custom((val, { req }) => {
			req.body.slug = slugify(val);
			return true;
		}),
	validorMiddleware,
];

exports.updateBrandValidator = [
	check('id').isMongoId().withMessage('Invalid Brand ID format'),
	body('name')
		.optional()
		.custom((value, { req }) => {
			req.body.slug = slugify(value);
			return true;
		}),
	validorMiddleware,
];

exports.deleteBrandValidator = [
	check('id').isMongoId().withMessage('Invalid Brand ID format'),
	validorMiddleware,
];
