const { check, body } = require('express-validator');
const validorMiddleware = require('../../middlewares/validatorMiddleware');
const CategoryModel = require('../../models/categoryModel');
const { default: slugify } = require('slugify');

exports.getSubCategoeyValidator = [
	check('id').isMongoId().withMessage('Invalid Subcategory ID format'),
	validorMiddleware,
];

exports.createSubCategoryValidator = [
	check('name')
		.notEmpty()
		.withMessage('Subcategory required')
		.isLength({ min: 2 })
		.withMessage('Subcategory name is too short')
		.isLength({ max: 32 })
		.withMessage('Subcategory name is too long')
		.custom((val, { req }) => {
			req.body.slug = slugify(val);
			return true;
		}),
	check('category')
		.notEmpty()
		.withMessage('Category is required')
		.isMongoId()
		.withMessage('Invalid Category ID')
		.custom((categoryId) =>
			CategoryModel.find({ _id: { $exists: true, $in: categoryId } }).then(
				(result) => {
					if (result < 1 || result.length !== categoryId.length) {
						return Promise.reject(new Error('Category not found'));
					}
				}
			)
		),

	validorMiddleware,
];

exports.updateSubCategoryValidator = [
	check('id').isMongoId().withMessage('Invalid Subcategory ID format'),
	body('name')
		.optional()
		.custom((val, { req }) => {
			req.body.slug = slugify(val);
			return true;
		}),
	validorMiddleware,
];

exports.deleteSubCategoryValidator = [
	check('id').isMongoId().withMessage('Invalid Subcategory ID format'),
	validorMiddleware,
];
