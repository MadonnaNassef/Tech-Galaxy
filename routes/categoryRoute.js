const express = require('express');
const {
	getCategoryValidator,
	updateCategoryValidator,
	deleteCategoryValidator,
	createCategoryValidator,
} = require('../utils/validators/categoryValidators');

const router = express.Router();
const {
	getCategories,
	getCategory,
	createCategory,
	updateCategroy,
	deleteCategroy,
} = require('../services/categoryService');

const { authorized, authenticated } = require('../services/authService');

const subCategoryRoute = require('./subCategoryRoute');

router
	.route('/')
	.get(getCategories)
	.post(
		authenticated,
		authorized('admin', 'manager'),
		createCategoryValidator,
		createCategory
	);
router
	.route('/:id')
	.get(getCategoryValidator, getCategory)
	.put(
		authenticated,
		authorized('admin', 'manager'),
		updateCategoryValidator,
		updateCategroy
	)
	.delete(
		authenticated,
		authorized('admin'),
		deleteCategoryValidator,
		deleteCategroy
	);

router.use('/:categoryId/subcategory', subCategoryRoute);

module.exports = router;
