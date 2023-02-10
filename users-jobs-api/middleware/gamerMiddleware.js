const AppError = require("../utils/appError");
const connection = require("../services/db");
const checkRoleExists = require("./checkRoleExists");
const checkGameExists = require("./checkGameExists");

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

//function to check if game exist if one or more are set in the body
async function checkGamesExist(req, res, next) {
	try {
		if (req.body.favorite_games_id) {
			for (let i = 0; i < req.body.favorite_games_id.length; i++) {
				const existingGame = await checkGameExists(
					req.body.favorite_games_id[i]
				);
				if (!existingGame) {
					return next(new AppError("Game does not exist", 400));
				}
			}
		}
		next();
	} catch (err) {
		return next(new AppError(err, 500));
	}
}

//function to check if role exist if one or more are set in the body
async function checkRolesExist(req, res, next) {
	try {
		if (req.body.favorite_roles_id) {
			for (let i = 0; i < req.body.favorite_roles_id.length; i++) {
				const existingRole = await checkRoleExists(
					req.body.favorite_roles_id[i]
				);
				if (!existingRole) {
					return next(new AppError("Role does not exist", 400));
				}
			}
		}
		next();
	} catch (err) {
		return next(new AppError(err, 500));
	}
}

//function to update total_earned of a gamer, will be used when a job where the gamer is assigned as chosen_gamer is set to done
async function updateTotalEarned(req, res, next) {
	if (!req.params.id) {
		return next(new AppError("No gamer id found", 404));
	}
	try {
		connection.query(
			"SELECT SUM(payment_amount) AS total_earned FROM jobs WHERE chosen_gamer_id = ?",
			[req.params.id],
			function (err, data, fields) {
				if (err) return next(new AppError(err, 500));
				connection.query(
					"UPDATE gamers SET total_earned = ? WHERE id = ?",
					[data[0].total_earned, req.params.id],
					function (err, data, fields) {
						if (err) return next(new AppError(err, 500));
						res.status(200).json({
							status: "success",
							length: data?.length,
							data: data
						});
					}
				);
			}
		);
	} catch (err) {
		return next(new AppError(err, 500));
	}
}

module.exports = {
	checkUsername,
	checkProfileType,
	checkBirthdateFormat,
	checkMinHourRate,
	checkHoursPerDay,
	checkGamesExist,
	checkRolesExist,
	updateTotalEarned
};
