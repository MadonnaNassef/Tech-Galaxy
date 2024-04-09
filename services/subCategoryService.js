const SubCategory = require('../models/subCategoryModel');
const factory = require('./handlersFactory');

exports.setCategoryInBody = (req, res, next) => {
	if (!req.body.category) req.body.category = req.params.categoryId;
	next();
};

// Create subcategory
// Post method, /api/subcategory
// Private access
exports.createSubCategory = factory.create(SubCategory);

// Update subcategory
// PUT /api/subcategory/:id
// Private
exports.updateSubCategroy = factory.update(SubCategory);
// Delete Category
// Delete /api/subcategory/:id
// Private
exports.deleteSubCategroy = factory.delete(SubCategory);

// get subcategories for a specific category
// get /api/categories/:categoryId/subcategory
exports.createFilterObj = (req, res, next) => {
	let filterObject = {};
	if (req.params.categoryId) filterObject = { category: req.params.categoryId };
	req.filterObject = filterObject;
	next();
};

// Get Subcategories
// Get /api/subcategory
// Public access
exports.getSubCategories = factory.getDocuments(SubCategory);

// Get specific Subcategory by id
// GET /api/subcategory/:id
// Public Access

exports.getSubCategory = factory.getSpecificDoc(SubCategory);
