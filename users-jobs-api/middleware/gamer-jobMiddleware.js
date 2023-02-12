const AppError = require("../utils/appError");
const connection = require("../services/db");
const checkUserExists = require("./checkUserExists");
const checkJobExists = require("./checkJobExists");

//function to check if applicants_id exists if one or more are set
async function checkApplicantsIdExists(req, res, next) {
	try {
		if (req.body.applicants_id) {
			for (let i = 0; i < req.body.applicants_id.length; i++) {
				const existingUser = await checkUserExists(req.body.applicants_id[i]);
				if (!existingUser) {
					return next(new AppError("Applicant not found", 404));
				}
			}
		}
		next();
	} catch (err) {
		return next(new AppError(err, 500));
	}
}

//function to check if
