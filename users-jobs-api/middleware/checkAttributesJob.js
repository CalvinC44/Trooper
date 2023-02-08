const AppError = require("../utils/appError");
const checkUserExists = require("../middleware/checkUserExists");
const checkGameExists = require("./checkGameExists");
const checkRoleExists = require("./checkRoleExists");
const checkJobExists = require("./checkJobExists");

async function checkAttributesJob(req, res, next) {
	try {
		//check if job exists if it is set in the params
		if (req.params.id) {
			const jobExists = await checkJobExists(req.params.id);
			if (!jobExists) {
				return next(new AppError("Job not found", 404));
			}
		}

		//check if recruiter_id exists if it is set
		if (req.body.recruiter_id) {
			const recruiter_id = await checkUserExists(req.body.recruiter_id);
			if (!recruiter_id) {
				return next(new AppError("Recruiter user not found", 404));
			}
		}

		// check if chosen_gamer_id exists if it is set
		if (req.body.chosen_gamer_id) {
			const chosen_gamer_id = await checkUserExists(req.body.chosen_gamer_id);
			if (!chosen_gamer_id) {
				return next(new AppError("Chosen gamer user not found", 404));
			}
		}

		//check if job_state is correct if it is set
		if (
			req.body.job_state &&
			req.body.job_state !== "Available" &&
			req.body.job_state !== "In Progress" &&
			req.body.job_state !== "Done"
		) {
			return next(new AppError("Incorrect type of job_state", 400));
		}

		//check if payment amount is correct if it is set
		if (req.body.payment_amount && req.body.payment_amount < 0) {
			return next(new AppError("Incorrect payment_amount", 400));
		}

		//check if game_id is correct if it is set
		if (req.body.game_id) {
			const game_id = await checkGameExists(req.body.game_id);
			if (!game_id) {
				return next(new AppError("Incorrect game_id", 400));
			}
		}

		//check if duration is an number and is correct if it is set
		if (
			req.body.duration &&
			req.body.duration < 0 &&
			isNaN(req.body.duration)
		) {
			return next(new AppError("Incorrect duration", 400));
		}

		//check if roles id exist, are correct if they are set
		if (req.body.roles) {
			if (!Array.isArray(req.body.roles)) {
				return next(new AppError("Incorrect type of roles", 400));
			}
			//check the roles id exist
			for (let i = 0; i < req.body.roles.length; i++) {
				const role_id = await checkRoleExists(req.body.roles[i]);
				if (!role_id) {
					return next(new AppError("Incorrect role_id", 400));
				}
			}
		}

		next();
	} catch (err) {
		return next(new AppError(err, 500));
	}
}

module.exports = checkAttributesJob;
