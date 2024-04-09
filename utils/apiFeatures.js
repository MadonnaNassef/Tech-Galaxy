class ApiFeatures {
	constructor(mongooseQuery, queryString) {
		this.mongooseQuery = mongooseQuery;
		this.queryString = queryString;
	}

	filter() {
		const filterQuery = { ...this.queryString };
		const exclude = ['page', 'limit', 'sort', 'fields', 'keyword'];
		exclude.forEach((value) => delete filterQuery[value]);

		let queryStr = JSON.stringify(filterQuery);
		queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

		this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryStr));

		return this;
	}

	sort() {
		if (this.queryString.sort) {
			const sortStr = this.queryString.sort.split(',').join(' ');
			this.mongooseQuery = this.mongooseQuery.sort(sortStr);
		} else this.mongooseQuery.sort('-createdAt');
		return this;
	}

	limitField() {
		if (this.queryString.fields) {
			const fieldsStr = this.queryString.fields.split(',').join(' ');
			this.mongooseQuery = this.mongooseQuery.select(fieldsStr);
		} else this.mongooseQuery.select('-__v');

		return this;
	}

	search(modelName) {
		if (this.queryString.keyword) {
			let searchQuery = {};
			if (modelName === 'Product') {
				searchQuery.$or = [
					{ title: { $regex: this.queryString.keyword, $options: 'i' } },
					{ description: { $regex: this.queryString.keyword, $options: 'i' } },
				];
			} else {
				searchQuery = {
					name: { $regex: this.queryString.keyword, $options: 'i' },
				};
			}
			this.mongooseQuery = this.mongooseQuery.find(searchQuery);
		}
		return this;
	}

	paginate(count) {
		const page = this.queryString.page * 1 || 1;
		const limit = this.queryString.limit * 1 || 10;
		const skip = (page - 1) * limit;
		const endPage = page * limit;

		const pagination = {};
		pagination.currentPage = page;
		pagination.totalPages = Math.ceil(count / limit);

		// Next page
		if (endPage < count) pagination.next = page + 1;

		if (skip > 0) pagination.previous = page - 1;

		this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);
		this.paginationResult = pagination;
		return this;
	}
}

module.exports = ApiFeatures;
