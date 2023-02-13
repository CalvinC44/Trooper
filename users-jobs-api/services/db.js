const mysql = require("mysql2");
require("dotenv").config();

const host = process.env.HOST;
const user = process.env.USER;
const password = process.env.PASSWORD;
const database = process.env.DATABASE;

const connection = mysql.createConnection({
	host: host,
	user: user,
	password: password,
	database: database
});

connection.connect(function (err) {
	if (err) {
		console.log("Error connecting to Db:", err);
		return;
	}
	console.log("Connection established");
});

module.exports = connection;
