const mongoose = require('mongoose');

const dbConnection = () => {
	mongoose.connect(process.env.DB_URI).then((con) => {
		console.log(`Database conected: ${con.connection.host}`);
	});
};

module.exports = dbConnection;
