const express = require('express');

const {
	createSubCategory,
	getSubCategories,
	getSubCategory,
	updateSubCategroy,
	deleteSubCategroy,
	setCategoryInBody,
	createFilterObj,
} = require('../services/subCategoryService');
const {
	createSubCategoryValidator,
	getSubCategoeyValidator,
	updateSubCategoryValidator,
	deleteSubCategoryValidator,
} = require('../utils/validators/subCategoryValidators');

const { authorized, authenticated } = require('../services/authService');

const router = express.Router({ mergeParams: true });

router
	.route('/')
	.post(
		authenticated,
		authorized('admin', 'manager'),
		setCategoryInBody,
		createSubCategoryValidator,
		createSubCategory
	)
	.get(createFilterObj, getSubCategories);

router
	.route('/:id')
	.get(getSubCategoeyValidator, getSubCategory)
	.put(
		authenticated,
		authorized('admin', 'manager'),
		updateSubCategoryValidator,
		updateSubCategroy
	)
	.delete(
		authenticated,
		authorized('admin'),
		deleteSubCategoryValidator,
		deleteSubCategroy
	);

module.exports = router;
