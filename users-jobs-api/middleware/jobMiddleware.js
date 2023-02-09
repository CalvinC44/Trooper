const AppError = require("../utils/appError");
const connection = require("../services/db");
const checkUserExists = require("../middleware/checkUserExists");
const checkGameExists = require("./checkGameExists");
const checkRoleExists = require("./checkRoleExists");

//function to check if job exists if it is set in the params
async function checkJobExists(req, res, next) {
	try {
		const existingJob = await new Promise((resolve, reject) => {
			connection.query(
				"SELECT 1 FROM jobs WHERE id = ?",
				[req.params.id],
				function (err, data, fields) {
					if (err) return reject(err);
					resolve(data);
				}
			);
		});
		if (existingJob.length == 0) {
			return next(new AppError("Job not found", 404));
		} else {
			next();
		}
	} catch (err) {
		return next(new AppError(err, 500));
	}
}

//function to check if game exists if it is set in the body
async function checkGameJobExists(req, res, next) {
	try {
		if (req.body.game_id) {
			const existingGame = await checkGameExists(req.body.game_id);
			if (!existingGame) {
				return next(new AppError("Game not found", 404));
			}
		}
		next();
	} catch (err) {
		return next(new AppError(err, 500));
	}
}

//function to check if job_state is correct if it is set
async function checkJobState(req, res, next) {
	try {
		if (req.body.job_state) {
			if (
				req.body.job_state != "Available" &&
				req.body.job_state != "In progress" &&
				req.body.job_state != "Done"
			) {
				return next(new AppError("Job state is not correct", 400));
			}
		}
		next();
	} catch (err) {
		return next(new AppError(err, 500));
	}
}

//function to check if payment_amount is correct if it is set
async function checkPaymentAmount(req, res, next) {
	try {
		if (req.body.payment_amount) {
			if (req.body.payment_amount < 0) {
				return next(new AppError("Payment amount is not correct", 400));
			}
		}
		next();
	} catch (err) {
		return next(new AppError(err, 500));
	}
}

//function to check if duration is correct if it is set
async function checkDuration(req, res, next) {
	try {
		if (
			req.body.duration &&
			req.body.duration < 0 &&
			isNaN(req.body.duration)
		) {
			return next(new AppError("Duration is not correct", 400));
		}
		next();
	} catch (err) {
		return next(new AppError(err, 500));
	}
}

//function to check if recruiter_id exists if it is set
async function checkRecruiterExists(req, res, next) {
	try {
		if (req.body.recruiter_id) {
			const existingUser = await checkUserExists(req.body.recruiter_id);
			if (!existingUser) {
				return next(new AppError("Recruiter not found", 404));
			}
		}
		next();
	} catch (err) {
		return next(new AppError(err, 500));
	}
}

//function to check if chosen_gamer_id exists if it is set
async function checkChosenGamerExists(req, res, next) {
	try {
		if (req.body.chosen_gamer_id) {
			const existingUser = await checkUserExists(req.body.chosen_gamer_id);
			if (!existingUser) {
				return next(new AppError("Chosen gamer not found", 404));
			}
		}
		next();
	} catch (err) {
		return next(new AppError(err, 500));
	}
}

//function to check if role exist if one or more are set
async function checkRolesExist(req, res, next) {
	try {
		if (req.body.roles_id) {
			for (let i = 0; i < req.body.roles_id.length; i++) {
				const existingRole = await checkRoleExists(req.body.roles_id[i]);
				if (!existingRole) {
					return next(new AppError("Role not found", 404));
				}
			}
		}
		next();
	} catch (err) {
		return next(new AppError(err, 500));
	}
}

module.exports = {
	checkJobExists,
	checkGameJobExists,
	checkJobState,
	checkPaymentAmount,
	checkDuration,
	checkRecruiterExists,
	checkChosenGamerExists,
	checkRolesExist
};
