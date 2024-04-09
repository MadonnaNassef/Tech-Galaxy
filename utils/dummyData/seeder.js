const fs = require('fs');
const dotenv = require('dotenv');
const Product = require('../../models/productsModel');
const dbConnection = require('../../config/database');

dotenv.config({ path: '../../config.env' });

dbConnection();

const products = JSON.parse(fs.readFileSync('../dummyData/products.json'));

const insertData = async () => {
	try {
		await Product.create(products);
		console.log('Data inserted');
		process.exit();
	} catch (error) {
		console.log(error);
	}
};

const deleteData = async () => {
	try {
		await Product.deleteMany();
		console.log('Data destroyed');
		process.exit();
	} catch (error) {
		console.log(error);
	}
};

if (process.argv[2] === '-i') {
	//node seeder.js -i
	insertData();
} else if (process.argv[2] === '-d') {
	//node seeder.js -d
	deleteData();
}
