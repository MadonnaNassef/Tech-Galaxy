const { check, body } = require('express-validator');
const validorMiddleware = require('../../middlewares/validatorMiddleware');
const { default: slugify } = require('slugify');

exports.getCategoryValidator = [
	check('id').isMongoId().withMessage('Invalid Category ID format'),
	validorMiddleware,
];

exports.createCategoryValidator = [
	check('name')
		.notEmpty()
		.withMessage('Category required')
		.isLength({ min: 3 })
		.withMessage('Category name is too short')
		.isLength({ max: 32 })
		.withMessage('Category name is too long')
		.custom((val, { req }) => {
			req.body.slug = slugify(val);
			return true;
		}),
	validorMiddleware,
];

exports.updateCategoryValidator = [
	check('id').isMongoId().withMessage('Invalid Category ID format'),
	body('name')
		.optional()
		.custom((value, { req }) => {
			req.body.slug = slugify(value);
			return true;
		}),
	validorMiddleware,
];

exports.deleteCategoryValidator = [
	check('id').isMongoId().withMessage('Invalid Category ID format'),
	validorMiddleware,
];
