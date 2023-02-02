const AppError = require("../utils/appError");
const connection = require("../services/db");

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
		next();
	} catch (err) {
		return next(new AppError(err, 500));
	}
}

module.exports = checkAttributes;
