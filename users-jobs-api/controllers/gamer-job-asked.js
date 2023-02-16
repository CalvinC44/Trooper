const AppError = require("../utils/appError");
const connection = require("../services/db");

//function to get all the gamers that have been asked for a job, get their gamer_id, gamer_name and application_state
exports.getJobAskedGamers = async (req, res, next) => {
	try {
		const { job_id } = req.params;

		const query = `SELECT gamer_name, gamer_id, application_state FROM gamers_jobs_asked INNER JOIN gamers ON gamers_jobs_asked.gamer_id = gamers.gamer_id WHERE job_id = ?`;
		const values = [job_id];

		connection.query(query, values, function (err, result) {
			if (err) {
				return next(new AppError(err.message, 400));
			}
			res.status(200).json({
				status: "success",
				data: result
			});
		});
	} catch (err) {
		return next(new AppError(err.message, 400));
	}
};

//DONE function for a recruiter to ask a gamer for a job
exports.askGamerForJob = async (req, res, next) => {
	try {
		const { gamer_id, job_id } = req.params;

		const query = `INSERT INTO gamers_jobs_asked (job_id, gamer_id) VALUES (?, ?)`;
		const values = [job_id, gamer_id];

		connection.query(query, values, function (err, result) {
			if (err) {
				return next(new AppError(err.message, 400));
			}
			res.status(200).json({
				status: "success",
				message: "Gamer asked for job successfully"
			});
		});
	} catch (err) {
		return next(new AppError(err.message, 400));
	}
};

//function to delete a job asked for a gamer
exports.deleteJobAsked = async (req, res, next) => {
	try {
		const { gamer_id, job_id } = req.params;

		const query = `DELETE FROM gamers_jobs_asked WHERE gamer_id = ? AND job_id = ?`;
		const values = [gamer_id, job_id];

		connection.query(query, values, function (err, result) {
			if (err) {
				return next(new AppError(err.message, 400));
			}
			res.status(200).json({
				status: "success",
				message: "Job asked for a gamer deleted successfully"
			});
		});
	} catch (err) {
		return next(new AppError(err.message, 400));
	}
};

//DONE function to get all the jobs that a gamer has been asked for, get their job_id, job_name and application_state
exports.getGamerJobsAsked = async (req, res, next) => {
	try {
		const { gamer_id } = req.params;

		const query = `SELECT job_name, job_id, application_state FROM gamers_jobs_asked INNER JOIN jobs ON gamers_jobs_asked.job_id = jobs.job_id WHERE gamer_id = ?`;
		const values = [gamer_id];

		connection.query(query, values, function (err, result) {
			if (err) {
				return next(new AppError(err.message, 400));
			}
			res.status(200).json({
				status: "success",
				data: result
			});
		});
	} catch (err) {
		return next(new AppError(err.message, 400));
	}
};

//function for a gamer to approve a job asked to him
exports.approveJobAsked = async (req, res, next) => {
	try {
		const { gamer_id, job_id } = req.params;

		connection.beginTransaction(function (err) {
			if (err) {
				connection.rollback(function () {
					return next(new AppError(err.message, 500));
				});
			}

			//update the application_state of the application
			const query = `UPDATE gamers_jobs_asked SET application_state = 'Approved' WHERE gamer_id = ? AND job_id = ?`;
			const values = [gamer_id, job_id];

			connection.query(query, values, function (err, result) {
				if (err) {
					connection.rollback(function () {
						return next(new AppError(err.message, 500));
					});
				}
			});

			//update the job, set the chosen_gamer_id to the gamer_id and set the job_state to in progress
			const query2 = `UPDATE jobs SET chosen_gamer_id = ?, job_state = 'In progress' WHERE job_id = ?`;
			const values2 = [gamer_id, job_id];

			connection.query(query2, values2, function (err, result) {
				if (err) {
					connection.rollback(function () {
						return next(new AppError(err.message, 500));
					});
				}
			});

			connection.commit(function (err) {
				if (err) {
					connection.rollback(function () {
						return next(new AppError(err.message, 500));
					});
				}
				res.status(200).json({
					status: "success",
					message: "Job approved successfully"
				});
			});
		});
	} catch (err) {
		return next(new AppError(err.message, 400));
	}
};

//function for a gamer to reject a job asked to him
exports.rejectJobAsked = async (req, res, next) => {
	try {
		const { gamer_id, job_id } = req.params;

		//update the application_state of the application
		const query = `UPDATE gamers_jobs_asked SET application_state = 'Rejected' WHERE gamer_id = ? AND job_id = ?`;
		const values = [gamer_id, job_id];

		connection.query(query, values, function (err, result) {
			if (err) {
				return next(new AppError(err.message, 400));
			}
			res.status(200).json({
				status: "success",
				message: "Job rejected successfully"
			});
		});
	} catch (err) {
		return next(new AppError(err.message, 400));
	}
};
