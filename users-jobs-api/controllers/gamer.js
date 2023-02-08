const AppError = require("../utils/appError");
const connection = require("../services/db");
const uuidv4 = require("uuid").v4;

//function to get all gamers
exports.getAllGamers = async (req, res, next) => {
	try {
		connection.query("SELECT * FROM gamers", function (err, data, fields) {
			if (err) return next(new AppError(err));
			res.status(200).json({
				status: "success",
				length: data?.length,
				data: data
			});
		});
	} catch (err) {
		return next(new AppError(err, 500));
	}
};

//function to get a gamer's id using its username
exports.getGamerId = async (req, res, next) => {
	try {
		if (!req.body.username)
			return next(new AppError("No gamer username found", 404));
		connection.query(
			"SELECT id FROM gamers WHERE username = ?",
			[req.body.username],
			function (err, data, fields) {
				if (err) return next(new AppError(err, 500));
				res.status(200).json({
					status: "success",
					length: data?.length,
					data: data
				});
			}
		);
	} catch (err) {
		return next(new AppError(err, 500));
	}
};

//function to get a gamer using its id
exports.getGamer = async (req, res, next) => {
	try {
		if (!req.params.id) return next(new AppError("No gamer id found", 404));
		connection.query(
			"SELECT * FROM gamers WHERE id = ?",
			[req.params.id],
			function (err, data, fields) {
				if (err) return next(new AppError(err, 500));
				res.status(200).json({
					status: "success",
					length: data?.length,
					data: data
				});
			}
		);
	} catch (err) {
		return next(new AppError(err, 500));
	}
};

// function to create gamer, require username, others are optional
exports.createGamer = async (req, res, next) => {
	try {
		if (!req.body) return next(new AppError("No form data found", 404));
		if (!req.body.username) return next(new AppError("No username found", 404));

		//generate a unique id for the gamer
		const gamer_id = uuidv4();

		//initiate query and values, username is required
		let query = "INSERT INTO gamers (id, username";
		let values = [gamer_id, req.body.username];

		//possibility to set other attributes of the gamer
		const columnMap = {
			profile_type: "profile_type",
			location: "location",
			birthdate: "birthdate",
			description: "description",
			name_discord: "name_discord",
			link_twitter: "link_twitter",
			link_linkedin: "link_linkedin",
			link_facebook: "link_facebook",
			min_hour_rate: "min_hour_rate",
			hours_per_day: "hours_per_day"
		};

		Object.keys(columnMap).forEach((key) => {
			if (req.body[key]) {
				query += `, ${columnMap[key]}`;
				values.push(req.body[key]);
			}
		});

		query += ") VALUES(?";
		for (let i = 1; i < values.length; i++) {
			query += ",?";
		}
		query += ")";

		connection.query(query, values, function (err, result) {
			if (err) return next(new AppError(err, 500));
			res.status(201).json({
				status: "success",
				message: "gamer created!",
				gamer_id: gamer_id
			});
		});
	} catch (err) {
		return next(new AppError(err, 500));
	}
};

//function to update a gamer
exports.updateGamer = async (req, res, next) => {
	try {
		if (!req.params.id || !req.body || Object.keys(req.body).length === 0) {
			return next(new AppError("No gamer id or form data found", 404));
		}

		//initiate query and values
		let query = "UPDATE gamers SET ";
		let values = [];

		const columnMap = {
			username: "username",
			profile_type: "profile_type",
			birthdate: "birthdate",
			description: "description",
			location: "location",
			birthdate: "birthdate",
			description: "description",
			name_discord: "name_discord",
			link_twitter: "link_twitter",
			link_linkedin: "link_linkedin",
			link_facebook: "link_facebook",
			min_hour_rate: "min_hour_rate",
			hours_per_day: "hours_per_day",
			total_earned: "total_earned"
		};

		Object.keys(columnMap).forEach((key) => {
			if (req.body[key]) {
				query += `${columnMap[key]} = ?, `;
				values.push(req.body[key]);
			}
		});

		query = query.slice(0, -2); // Removing the last comma and space
		query += " WHERE id = ?";
		values.push(req.params.id);

		connection.query(query, values, function (err, data, fields) {
			if (err) return next(new AppError(err, 500));
			res.status(200).json({
				status: "success",
				message: "gamer updated!"
			});
		});
	} catch (err) {
		return next(new AppError(err, 500));
	}
};

//function to delete a gamer using its id
exports.deleteGamer = async (req, res, next) => {
	try {
		if (!req.params.id) {
			return next(new AppError("No gamer id found", 404));
		}
		connection.query(
			"DELETE FROM gamers WHERE id=?",
			[req.params.id],
			function (err, result) {
				if (err) return next(new AppError(err, 500));
				if (result.affectedRows === 0) {
					return next(new AppError("Gamer not found", 404));
				}
				res.status(204).json({
					status: "success",
					message: "gamer deleted!"
				});
			}
		);
	} catch (err) {
		return next(new AppError(err, 500));
	}
};
