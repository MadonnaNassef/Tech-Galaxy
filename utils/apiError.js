// @desc This class is responsible for ooperational errors

class ApiError extends Error {
	constructor(message, statusCode) {
		super(message);
		this.statusCode = statusCode;
		this.status = `${statusCode}`.startsWith(4) ? 'Fail' : 'Error';
		this.isOperational = true;
	}
}

module.exports = ApiError;
