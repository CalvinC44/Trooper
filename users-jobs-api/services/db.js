const mysql = require("mysql2");
require("dotenv").config();

const password = process.env.PASSWORD;

const connection = mysql.createConnection({
	host: "trooperdb-test.c9ikqootrb58.eu-west-3.rds.amazonaws.com",
	user: "admin_trooper",
	password: password,
	database: "trooperdb"
});

connection.connect(function (err) {
	if (err) {
		console.log("Error connecting to Db:", err);
		return;
	}
	console.log("Connection established");
});

module.exports = connection;
