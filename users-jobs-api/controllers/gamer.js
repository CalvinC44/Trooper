const AppError = require("../utils/appError");
const connection = require("../services/db");

//function to get all gamers
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

//function to get a gamer's id using its username
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

//function to get a gamer using its id
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

//function to update a gamer
exports.updateGamer = (req, res, next) => {
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
	console.log(query);

	connection.query(query, values, function (err, data, fields) {
		if (err) return next(new AppError(err, 500));
		res.status(200).json({
			status: "success",
			message: "gamer updated!"
		});
	});
};

//function to delete a gamer using its id
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

// function to create gamer, require username, others are optional
exports.createGamer = async (req, res, next) => {
	try {
		if (!req.body) return next(new AppError("No form data found", 404));
		if (!req.body.username) return next(new AppError("No username found", 404));

		//check attributes using checkAttributes, if error, return error, else do query
		const error = await checkAttributes(req, res, next);
		console.log(error);
		if (error) {
			console.log("ya  un error");
			return next(error);
		} else {
			//initiate query and values, username and profile_type are required
			let query = "INSERT INTO gamers (username, profile_type";
			let values = [req.body.username, req.body.profile_type];

			//possibility to set other attributes of the gamer
			const columnMap = {
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
				console.log("je fais la requete mon gars");
				if (err) return next(new AppError(err, 500));
				res.status(201).json({
					status: "success",
					message: "gamer created!",
					data: result
				});
			});
		}
	} catch (err) {
		return next(new AppError(err, 500));
	}
};

async function checkAttributes(req, res, next) {
	try {
		//check if username is already taken
		const existingUser = await new Promise((resolve, reject) => {
			connection.query(
				"SELECT * FROM gamers WHERE username = ?",
				[req.body.username],
				function (err, data, fields) {
					if (err) return reject(err);
					resolve(data);
				}
			);
		});

		if (existingUser.length > 0) {
			return next(new AppError("Username already taken", 400));
		}

		//check if profile_type is correct
		if (
			req.body.profile_type &&
			req.body.profile_type !== "Gamer" &&
			req.body.profile_type !== "Recruiter" &&
			req.body.profile_type !== "Guild Manager"
		) {
			return next(new AppError("Incorrect type of profile", 400));
		}

		//check if birthdate is correct format for mysql
		if (
			req.body.birthdate &&
			!req.body.birthdate.match(/^\d{4}-\d{2}-\d{2}$/)
		) {
			return next(new AppError("Incorrect date format", 400));
		}

		//check if min_hour_rate is correct
		if (req.body.min_hour_rate && req.body.min_hour_rate <= 0) {
			return next(new AppError("Wrong minimum hour rate value", 400));
		}

		//check if hours_per_day is correct
		if (
			req.body.hours_per_day &&
			(req.body.hours_per_day <= 0 || req.body.hours_per_day > 24)
		) {
			return next(new AppError("Wrong hours per day value", 400));
		}

		return null;
	} catch (err) {
		return next(new AppError(err, 500));
	}
}
