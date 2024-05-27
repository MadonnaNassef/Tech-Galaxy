const Review = require('../models/reviewModel');
const factory = require('./handlersFactory');

// Nested
exports.setIdsInBody = (req, res, next) => {
	if (!req.body.product) req.body.product = req.params.productId;
	if (!req.body.user) req.body.user = req.user._id;
	next();
};

// Create Review
// Post method, /api/reviews
// Private access/ User
exports.createReview = factory.create(Review);

// Update getReview
// PUT /api/reviews/:id
// Private/ User
exports.updateReview = factory.update(Review);

// Delete Review
// Delete /api/reviews/:id
// Private / All
exports.deleteReview = factory.delete(Review);

// Get reviews
// Get /api/reviews
// Public access
exports.getReviews = factory.getDocuments(Review);

// Get specific getReview by id
// GET /api/reviews/:id
// Public Access

exports.getReview = factory.getSpecificDoc(Review);

// Nested route
// GET /api/product/:productId/reviews
exports.createFilterObj = (req, res, next) => {
	let filterObject = {};
	if (req.params.productId) filterObject = { product: req.params.productId };
	req.filterObject = filterObject;
	next();
};
