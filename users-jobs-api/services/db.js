const mysql = require("mysql2");
require("dotenv").config();

const password = process.env.PASSWORD;

const connection = mysql.createConnection({
	host: "localhost",
	user: "user",
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
