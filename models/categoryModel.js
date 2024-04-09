const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Category required'],
			unique: [true, 'Category must be unique'],
			minlength: [3, 'Category name is too short'],
			maxlength: [32, 'Category name is too long'],
		},
		slug: {
			type: String,
			lowercase: true,
		},
	},
	{ timestamps: true }
);

const CategoryModel = mongoose.model('Category', categorySchema);

module.exports = CategoryModel;
