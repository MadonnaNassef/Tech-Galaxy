const { check, body } = require('express-validator');
const validorMiddleware = require('../../middlewares/validatorMiddleware');
const Review = require('../../models/reviewModel');

exports.getReviewValidator = [
	check('id').isMongoId().withMessage('Invalid Review ID format'),
	validorMiddleware,
];

exports.createReviewValidator = [
	check('title').optional(),
	check('ratings')
		.notEmpty()
		.withMessage('Must provide a rating')
		.isLength({ min: 1, max: 5 })
		.withMessage('rating is invalid'),
	check('user').isMongoId().withMessage('Invalid Review ID format'),
	check('product')
		.isMongoId()
		.withMessage('Invalid Review ID format')
		.custom((value, { req }) =>
			Review.findOne({ user: req.user._id, product: req.body.product }).then(
				(review) => {
					if (review) {
						return Promise.reject(
							new Error('You already created a review before')
						);
					}
				}
			)
		),
	validorMiddleware,
];

exports.updateReviewValidator = [
	check('id')
		.isMongoId()
		.withMessage('Invalid Review ID format')
		.custom((value, { req }) =>
			Review.findById(value).then((review) => {
				if (!review) {
					return Promise.reject(new Error('No review found for this ID'));
				}
				if (review.user._id.toString() !== req.user._id.toString()) {
					return Promise.reject(
						new Error(`You can't edit other people's reviews`)
					);
				}
			})
		),
	body('title').optional(),
	validorMiddleware,
];

exports.deleteReviewValidator = [
	check('id')
		.isMongoId()
		.withMessage('Invalid Review ID format')
		.custom((value, { req }) => {
			if (req.user.role === 'user') {
				return Review.findById(value).then((review) => {
					if (!review) {
						return Promise.reject(new Error('No review found for this ID'));
					}
					if (review.user._id.toString() !== req.user._id.toString()) {
						return Promise.reject(
							new Error(`You can't delete other people's reviews`)
						);
					}
				});
			}
			return true;
		}),
	validorMiddleware,
];
