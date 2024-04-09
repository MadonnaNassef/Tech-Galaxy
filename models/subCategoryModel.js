const mongoose = require('mongoose');

const subCategorySchema = new mongoose.Schema(
	{
		name: {
			type: String,
			trim: true,
			required: [true, 'Subcategory required'],
			unique: [true, 'Subcategory must be unique'],
			minlength: [2, 'Subcategory name is too short'],
			maxlength: [32, 'Subcategory name is too long'],
		},
		slug: {
			type: String,
			lowercase: true,
		},
		category: {
			type: [{ type: mongoose.Schema.ObjectId, ref: 'Category' }],
			required: [true, 'Subcategory must belong to a main Category'],
		},
	},
	{ timestamps: true }
);

const subCategoryModel = mongoose.model('Subcategory', subCategorySchema);

module.exports = subCategoryModel;
