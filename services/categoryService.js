const Category = require('../models/categoryModel');
const factory = require('./handlersFactory');

// Create category
// Post method, /api/categories
// Private access
exports.createCategory = factory.create(Category);
// Update Category
// PUT /api/categories/:id
// Private
exports.updateCategroy = factory.update(Category);

// Delete Category
// Delete /api/categories/:id
// Private
exports.deleteCategroy = factory.delete(Category);

// Get Categories
// Get /api/categories
// Public access
exports.getCategories = factory.getDocuments(Category);

// Get specific Category by id
// GET /api/categories/:id
// Public Access

exports.getCategory = factory.getSpecificDoc(Category);
