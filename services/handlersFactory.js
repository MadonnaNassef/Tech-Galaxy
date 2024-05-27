const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');
const ApiFeatures = require('../utils/apiFeatures');

exports.delete = (Model) =>
	asyncHandler(async (req, res, next) => {
		const { id } = req.params;
		const document = await Model.findByIdAndDelete(id);

		if (!document) {
			return next(new ApiError(`No document for this id ${id}`, 404));
		}
		res.status(204).send();
	});

exports.update = (Model) =>
	asyncHandler(async (req, res, next) => {
		const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
		});
		if (!Model) {
			return next(new ApiError(`Document not found for ${req.params.id}`, 404));
		}
		document.save();
		res.status(200).json({ data: document });
	});

exports.create = (Model) =>
	asyncHandler(async (req, res) => {
		const document = await Model.create(req.body);
		res.status(201).json({ data: document });
	});

exports.getSpecificDoc = (Model, populationOption) =>
	asyncHandler(async (req, res, next) => {
		let query = Model.findById(req.params.id);
		if (populationOption) {
			query = query
				.populate(populationOption)
				.select(
					'-passwordResetCode -passwordResetExpiry -passwordResetVerified -__v -role -emailVerificationToken -emailVerificationExpiry'
				);
		}
		const document = await query;

		if (!document) {
			return next(new ApiError(`Document not found for ${req.params.id}`, 404));
		}
		res.status(200).json({ data: document });
	});

exports.getDocuments = (Model, modelName = '') =>
	asyncHandler(async (req, res) => {
		let filter = {};
		if (req.filterObject) filter = req.filterObject;
		// Build query
		const countDocuments = await Model.countDocuments();
		const apiFeatures = new ApiFeatures(Model.find(filter), req.query)
			.paginate(countDocuments)
			.filter()
			.search(modelName)
			.limitField()
			.sort();

		// Excute query
		const { mongooseQuery, paginationResult } = apiFeatures;
		const documents = await mongooseQuery;

		res
			.status(200)
			.json({ results: documents.length, paginationResult, data: documents });
	});
