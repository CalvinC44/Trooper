const AppError = require("../utils/appError");
const connection = require("../services/db");

async function checkUsername(req, res, next) {
	try {
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

		if (existingUser.length == 0) {
			next();
		}
		//if the username already exists, check if it belongs to the same user that is trying to update its profile (in this case, the username is not duplicated)
		else if (
			req.params.id &&
			existingUser.length > 0 &&
			existingUser[0].id == req.params.id
		) {
			next();
		} else {
			return next(new AppError("Username already taken", 400));
		}
	} catch (err) {
		return next(new AppError(err, 500));
	}
}

function checkProfileType(req, res, next) {
	if (
		req.body.profile_type &&
		req.body.profile_type !== "Gamer" &&
		req.body.profile_type !== "Recruiter" &&
		req.body.profile_type !== "Guild Manager"
	) {
		return next(new AppError("Incorrect type of profile", 400));
	}

	next();
}

function checkBirthdateFormat(req, res, next) {
	if (req.body.birthdate && !req.body.birthdate.match(/^\d{4}-\d{2}-\d{2}$/)) {
		return next(new AppError("Incorrect date format", 400));
	}

	next();
}

function checkMinHourRate(req, res, next) {
	if (req.body.min_hour_rate && req.body.min_hour_rate <= 0) {
		return next(new AppError("Wrong minimum hour rate value", 400));
	}

	next();
}

function checkHoursPerDay(req, res, next) {
	if (
		req.body.hours_per_day &&
		(req.body.hours_per_day <= 0 || req.body.hours_per_day > 24)
	) {
		return next(new AppError("Wrong hours per day value", 400));
	}

	next();
}

module.exports = {
	checkUsername,
	checkProfileType,
	checkBirthdateFormat,
	checkMinHourRate,
	checkHoursPerDay
};
