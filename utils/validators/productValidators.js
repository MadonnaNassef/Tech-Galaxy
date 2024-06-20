/* eslint-disable no-undef */
const { check, body } = require('express-validator');
const validorMiddleware = require('../../middlewares/validatorMiddleware');
const CategoryModel = require('../../models/categoryModel');
const BrandModel = require('../../models/brandModel');
const subCategoryModel = require('../../models/subCategoryModel');
const { default: slugify } = require('slugify');

exports.createProductValidator = [
	check('title')
		.notEmpty()
		.withMessage('Product name is required')
		.isLength({ min: 3 })
		.withMessage('Product name is too short')
		.custom((val, { req }) => {
			req.body.slug = slugify(val);
			return true;
		}),
	check('description')
		.notEmpty()
		.withMessage('Product description is required'),
	check('quantity')
		.notEmpty()
		.withMessage('Product quantity is required')
		.isNumeric()
		.withMessage('Product quantity must be a number'),
	check('sold')
		.optional()
		.isNumeric()
		.withMessage('Product quantity must be a number'),
	check('price')
		.notEmpty()
		.withMessage('Product price is required')
		.isNumeric()
		.withMessage('Product price must be a number')
		.isLength({ max: 20 })
		.withMessage('Invalid price'),
	check('priceAfterDiscount')
		.optional()
		.isNumeric()
		.withMessage('Product price must be a number')
		.toFloat()
		.custom((value, { req }) => {
			if (req.body.price <= value) {
				throw (err = new Error('Discounted price must be lower than original'));
			}
			return true;
		}),
	check('colors').isArray().optional(),
	check('images').isArray().optional(),
	check('coverImage').optional(),
	// .notEmpty().withMessage('Must provide a cover image'),
	check('category')
		.notEmpty()
		.withMessage('Category is required')
		.isMongoId()
		.withMessage('Invalid Category ID')
		.custom((categoryId) =>
			CategoryModel.findById(categoryId).then((category) => {
				if (!category) return Promise.reject(new Error('Category not found'));
			})
		),
	check('subCategory')
		.notEmpty()
		.withMessage('Subcategory is required')
		.isMongoId()
		.withMessage('Invalid Subcategory ID')
		.custom((subCategoryId) =>
			subCategoryModel.findById(subCategoryId).then((subCategory) => {
				if (!subCategory)
					return Promise.reject(new Error('Subcategory not found'));
			})
		)
		.custom((value, { req }) =>
			subCategoryModel
				.find({ category: req.body.category })
				.then((subcategories) => {
					const subCategoryId = [];
					subcategories.forEach((subCategory) => {
						subCategoryId.push(subCategory._id.toString());
					});
					if (!subCategoryId.includes(value)) {
						return Promise.reject(
							new Error('Subcategory does not belong to this category')
						);
					}
				})
		),
	check('brand')
		.notEmpty()
		.withMessage('Brand is required')
		.isMongoId()
		.withMessage('Invalid Brand ID')
		.custom((brandId) =>
			BrandModel.findById(brandId).then((brand) => {
				if (!brand) return Promise.reject(new Error('Brand not found'));
			})
		),
	check('ratingsAverage')
		.optional()
		.isNumeric()
		.withMessage('Rating must be a number')
		.isLength({ min: 1, max: 5 })
		.withMessage('Invalid rating'),
	check('ratingQuantity').isNumeric().optional(),
	validorMiddleware,
];

exports.getProductValidator = [
	check('id').isMongoId().withMessage('Invalid Product ID format'),
	validorMiddleware,
];

exports.updateProductValidator = [
	check('id').isMongoId().withMessage('Invalid Product ID format'),
	body('title')
		.optional()
		.custom((value, { req }) => {
			if (value) {
				// Corrected typo: `tilte` to `value`
				req.body.slug = slugify(value); // Assuming `slugify` function is defined elsewhere
				return true;
			}
		}),
	check('description').optional(),
	check('ratingsAverage').optional(),
	check('priceAfterDiscount').optional(),
	check('price').optional(),
	check('quantity').optional(),
	validorMiddleware,
];

exports.deleteProductValidator = [
	check('id').isMongoId().withMessage('Invalid Product ID format'),
	validorMiddleware,
];
