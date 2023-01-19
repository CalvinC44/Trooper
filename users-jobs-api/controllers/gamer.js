const AppError = require("../utils/appError");
const connection = require("../services/db");

exports.getAllGamers = (req, res, next) => {
	connection.query("SELECT * FROM gamers", function (err, data, fields) {
		if (err) return next(new AppError(err));
		res.status(200).json({
			status: "success",
			length: data?.length,
			data: data
		});
	});
};

exports.createGamer = (req, res, next) => {
	if (!req.body.username) return next(new AppError("No username found", 404));
	if (
		req.body.profile_type !== "Gamer" &&
		req.body.profile_type !== "Recruiter" &&
		req.body.profile_type !== "Guild Manager"
	)
		return next(new AppError("Incorrect type of profile", 400));
	const values = [req.body.username, req.body.profile_type];
	connection.query(
		"INSERT INTO gamers (username, profile_type) VALUES(?,?)",
		values,
		function (err, result) {
			if (err) return next(new AppError(err, 500));
			res.status(201).json({
				status: "success",
				message: "gamer created!",
				data: result
			});
		}
	);
};

exports.getGamerId = (req, res, next) => {
	if (!req.body.username)
		return next(new AppError("No gamer username found", 404));
	connection.query(
		"SELECT * FROM gamers WHERE username = ?",
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
};

exports.getGamer = (req, res, next) => {
	if (!req.params.id) {
		return next(new AppError("No gamer id found", 404));
	}
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
};

exports.updateGamer = (req, res, next) => {
	if (!req.params.id || !req.body || Object.keys(req.body).length === 0) {
		return next(new AppError("No gamer id or form data found", 404));
	}
	if (
		req.body.profile_type &&
		req.body.profile_type !== "Gamer" &&
		req.body.profile_type !== "Recruiter" &&
		req.body.profile_type !== "Guild Manager"
	)
		return next(new AppError("Incorrect type of profile", 400));
	let query = "UPDATE gamers SET ";
	let values = [];
	if (req.body.username) {
		query += "username = ?, ";
		values.push(req.body.username);
	}
	if (req.body.profile_type) {
		query += "profile_type = ?, ";
		values.push(req.body.profile_type);
	}
	if (req.body.birthdate) {
		query += "birthdate = ?, ";
		values.push(req.body.birthdate);
	}
	if (req.body.description) {
		query += "description = ?, ";
		values.push(req.body.description);
	}
	if (req.body.location) {
		query += "location = ?, ";
		values.push(req.body.location);
	}
	if (req.body.name_discord) {
		query += "name_discord = ?, ";
		values.push(req.body.name_discord);
	}
	if (req.body.link_twitter) {
		query += "link_twitter = ?, ";
		values.push(req.body.link_twitter);
	}
	if (req.body.link_linkedin) {
		query += "link_linkedin = ?, ";
		values.push(req.body.link_linkedin);
	}
	if (req.body.link_facebook) {
		query += "link_facebook = ?, ";
		values.push(req.body.link_facebook);
	}
	if (req.body.min_hour_rate) {
		query += "min_hour_rate = ?, ";
		values.push(req.body.min_hour_rate);
	}
	if (req.body.hours_per_day) {
		query += "hours_per_day = ?, ";
		values.push(req.body.hours_per_day);
	}
	if (req.body.total_earned) {
		query += "total_earned = ?, ";
		values.push(req.body.total_earned);
	}
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
};

exports.deleteGamer = (req, res, next) => {
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
};
