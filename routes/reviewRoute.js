const express = require('express');

const {
	getReviewValidator,
	updateReviewValidator,
	deleteReviewValidator,
	createReviewValidator,
} = require('../utils/validators/reviewValidators');

const router = express.Router({ mergeParams: true });

const {
	getReviews,
	getReview,
	createReview,
	updateReview,
	deleteReview,
	createFilterObj,
	setIdsInBody,
} = require('../services/reviewService');

const { authenticated, authorized } = require('../services/authService');

router
	.route('/')
	.get(createFilterObj, getReviews)
	.post(
		authenticated,
		authorized('user'),
		setIdsInBody,
		createReviewValidator,
		createReview
	);
router
	.route('/:id')
	.get(getReviewValidator, getReview)
	.put(authenticated, authorized('user'), updateReviewValidator, updateReview)
	.delete(
		authenticated,
		authorized('admin', 'manager', 'user'),
		deleteReviewValidator,
		deleteReview
	);

module.exports = router;
