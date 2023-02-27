const AppError = require("../utils/appError");
const { pool } = require("../services/db");

//function to get all the gamers that have been asked for a job, get their gamer_id, gamer_name and recruitment_state
exports.getJobAskedGamers = async (req, res, next) => {
	try {
		const { job_id } = req.params;
		const [rows] = await pool
			.promise()
			.execute(
				`SELECT gamer_name, gamers_jobs_asked.gamer_id, recruitment_state FROM gamers_jobs_asked INNER JOIN gamers ON gamers_jobs_asked.gamer_id = gamers.gamer_id WHERE job_id = ?`,
				[job_id]
			);
		res.status(200).json({
			status: "success",
			data: rows
		});
	} catch (err) {
		return next(new AppError(err.message, 400));
	}
};

//function for a recruiter to ask a gamer for a job
exports.askGamerForJob = async (req, res, next) => {
	try {
		const { gamer_id, job_id } = req.params;

		await pool
			.promise()
			.execute(
				`INSERT INTO gamers_jobs_asked (gamer_id, job_id) VALUES (?, ?)`,
				[gamer_id, job_id]
			);
		res.status(200).json({
			status: "success",
			message: "Gamer asked for job successfully"
		});
	} catch (err) {
		return next(new AppError(err.message, 400));
	}
};

//function to delete a job asked to a gamer
exports.deleteJobAsked = async (req, res, next) => {
	try {
		const { gamer_id, job_id } = req.params;

		await pool
			.promise()
			.execute(
				`DELETE FROM gamers_jobs_asked WHERE gamer_id = ? AND job_id = ?`,
				[gamer_id, job_id]
			);
		res.status(200).json({
			status: "success",
			message: "Job asked to a gamer deleted successfully"
		});
	} catch (err) {
		return next(new AppError(err.message, 400));
	}
};

//DONE function to get all the jobs that a gamer has been asked for, get their job_id, job_name and recruitment_state
exports.getGamerJobsAsked = async (req, res, next) => {
	try {
		const { gamer_id } = req.body;

		const [rows] = await pool
			.promise()
			.execute(
				`SELECT job_name, job_id, recruitment_state FROM gamers_jobs_asked INNER JOIN jobs ON gamers_jobs_asked.job_id = jobs.job_id WHERE gamer_id = ?`,
				[gamer_id]
			);
		res.status(200).json({
			status: "success",
			data: rows
		});
	} catch (err) {
		return next(new AppError(err.message, 400));
	}
};

//function for a gamer to accept a job asked to him
exports.acceptJobAsked = async (req, res, next) => {
	const connection = await pool.promise().getConnection();

	try {
		await connection.beginTransaction();

		const { job_id } = req.params;
		const { gamer_id } = req.body;

		await connection.execute(
			`UPDATE gamers_jobs_asked SET recruitment_state = 'Accepted' WHERE gamer_id = ? AND job_id = ?`,
			[gamer_id, job_id]
		);

		await connection.execute(
			`UPDATE jobs SET chosen_gamer_id = ?, job_state = 'In progress' WHERE job_id = ?`,
			[gamer_id, job_id]
		);

		await connection.commit();
		res.status(200).json({
			status: "success",
			message: "Job accepted successfully"
		});
	} catch (err) {
		await connection.rollback();
		return next(new AppError(err.message, 400));
	} finally {
		connection.release();
	}
};

//function for a gamer to refuse a job asked to him
exports.refuseJobAsked = async (req, res, next) => {
	try {
		const { job_id } = req.params;
		const { gamer_id } = req.body;

		await pool
			.promise()
			.execute(
				`UPDATE gamers_jobs_asked SET recruitment_state = 'Refused' WHERE gamer_id = ? AND job_id = ?`,
				[gamer_id, job_id]
			);
		res.status(200).json({
			status: "success",
			message: "Job refused successfully"
		});
	} catch (err) {
		return next(new AppError(err.message, 400));
	}
};
