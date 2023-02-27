const AppError = require("../utils/appError");
const { pool } = require("../services/db");
const checkUserExists = require("./checkUserExists");
const checkJobExists = require("./checkJobExists");

//function to check if gamer_id exists
async function checkApplicantIdExists(req, res, next) {
	try {
		const gamer_id = req.params.gamer_id
			? req.params.gamer_id
			: req.body.gamer_id;

		const existingUser = await checkUserExists(gamer_id);
		if (!existingUser) {
			return next(new AppError("Applicant not found", 404));
		}
		next();
	} catch (err) {
		return next(new AppError(err, 500));
	}
}

//function to check if job_id applied for exists
async function checkJobIdExists(req, res, next) {
	try {
		const existingJob = await checkJobExists(req.params.job_id);
		if (!existingJob) {
			return next(new AppError("Job not found", 404));
		}
		next();
	} catch (err) {
		return next(new AppError(err, 500));
	}
}

//function to check if duplicate application exists
async function checkDuplicateApplication(req, res, next) {
	const { gamer_id } = req.body;
	const { job_id } = req.params;

	try {
		const [rows] = await pool
			.promise()
			.execute(
				`SELECT * FROM gamers_jobs_applications WHERE gamer_id = ? AND job_id = ?`,
				[gamer_id, job_id]
			);
		if (rows.length > 0) {
			return next(
				new AppError(
					"Duplicate application this gamer already applied for this job",
					400
				)
			);
		}
		next();
	} catch (err) {
		return next(new AppError(err.message, 400));
	}
}

//function to check if application exists
async function checkApplicationExists(req, res, next) {
	const gamer_id = req.params.gamer_id
		? req.params.gamer_id
		: req.body.gamer_id;
	const { job_id } = req.params;

	if (!gamer_id) return next(new AppError("gamer_id is required", 400));
	if (!job_id) return next(new AppError("job_id is required", 400));

	try {
		const [rows] = await pool
			.promise()
			.execute(
				`SELECT * FROM gamers_jobs_applications WHERE gamer_id = ? AND job_id = ?`,
				[gamer_id, job_id]
			);
		if (rows.length === 0) {
			return next(new AppError("Job application not found", 404));
		}
		next();
	} catch (err) {
		return next(new AppError(err.message, 400));
	}
}

//function to check if application is already approved
async function checkApplicationApproved(req, res, next) {
	const gamer_id = req.params.gamer_id
		? req.params.gamer_id
		: req.body.gamer_id;
	const job_id = req.params.job_id;
	try {
		const [rows] = await pool
			.promise()
			.execute(
				`SELECT * FROM gamers_jobs_applications WHERE job_id = ? AND gamer_id = ? AND application_state = ?`,
				[job_id, gamer_id, "Approved"]
			);
		if (rows.length > 0) {
			return next(new AppError("Application already been approved", 400));
		}
		next();
	} catch (err) {
		return next(new AppError(err.message, 400));
	}
}

//function to check if application is already rejected
async function checkApplicationRejected(req, res, next) {
	const gamer_id = req.params.gamer_id
		? req.params.gamer_id
		: req.body.gamer_id;
	const job_id = req.params.job_id;
	try {
		const [rows] = await pool
			.promise()
			.execute(
				`SELECT * FROM gamers_jobs_applications WHERE job_id = ? AND gamer_id = ? AND application_state = ?`,
				[job_id, gamer_id, "Rejected"]
			);
		if (rows.length > 0) {
			return next(new AppError("Application already been rejected", 400));
		}
		next();
	} catch (err) {
		return next(new AppError(err.message, 400));
	}
}

module.exports = {
	checkApplicantIdExists,
	checkJobIdExists,
	checkDuplicateApplication,
	checkApplicationExists,
	checkApplicationApproved,
	checkApplicationRejected
};
