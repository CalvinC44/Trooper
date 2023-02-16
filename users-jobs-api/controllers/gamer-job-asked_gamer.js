const AppError = require("../utils/appError");
const connection = require("../services/db");

//function to get all the jobs that a gamer has been asked for, get their job_id, job_name and application_state
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

//function for a recruiter to ask a gamer for a job
exports.askGamerForJob = async (req, res, next) => {
	try {
		const { gamer_id, job_id } = req.params;

		const query = `INSERT INTO gamers_jobs_asked (job_id, gamer_id) VALUES (?, ?)`;
		const values = [job_id, gamer_id];

//TODO function to make a gamer apply for a job
exports.applyForJob = async (req, res, next) => {
	try {
		const { gamer_id, job_id } = req.params;

		const query = `INSERT INTO gamers_jobs_applicants (job_id, gamer_id) VALUES (?, ?)`;
		const values = [job_id, gamer_id];

		connection.query(query, values, function (err, result) {
			if (err) {
				return next(new AppError(err.message, 400));
			}
			res.status(200).json({
				status: "success",
				message: "Gamer applied for job successfully"
			});
		});
	} catch (err) {
		return next(new AppError(err.message, 400));
	}
};

//TODO function for a gamer to delete an application for a job, //TODO MIDDLEWARE if the application is pending
exports.deleteApplication = async (req, res, next) => {
	try {
		const { gamer_id, job_id } = req.params;

		//update the application_state of the application
		const query = `DELETE FROM gamers_jobs_applicants WHERE job_id = ? AND gamer_id = ?`;
		const values = [job_id, gamer_id];

		connection.query(query, values, function (err, result) {
			if (err) {
				return next(new AppError(err.message, 400));
			}
			res.status(200).json({
				status: "success",
				message: "Gamer deleted application for job successfully"
			});
		});
	} catch (err) {
		return next(new AppError(err.message, 400));
	}
};

//TODO function to get all the applications for a job, get their gamer_id, their gamer_name and application_state
exports.getJobApplications = async (req, res, next) => {
	try {
		const { job_id } = req.params;

		const query = `SELECT * FROM gamers_jobs_applicants WHERE job_id = ?`;
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

//TODO function for a recruiter to approve an application for a job
exports.approveApplication = async (req, res, next) => {
	try {
		const { job_id, gamer_id } = req.params;

		connection.beginTransaction(function (err) {
			if (err) {
				connection.rollback(function () {
					return next(new AppError(err.message, 500));
				});
			}

			//update the application_state of the application
			const query = `UPDATE gamers_jobs_applicants SET application_state = 'accepted' WHERE job_id = ? AND gamer_id = ?`;
			const values = [job_id, gamer_id];

			connection.query(query, values, function (err, result) {
				if (err) {
					connection.rollback(function () {
						return next(new AppError(err.message, 500));
					});
				}
			});

			//update the job, set the chosen_gamer_id to the gamer_id and set the job_state to in progress
			const query2 = `UPDATE jobs SET job_state = 'In progress', chosen_gamer_id = ? WHERE job_id = ?`;
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
					message: "Gamer approved for job successfully"
				});
			});
		});
	} catch (err) {
		return next(new AppError(err.message, 400));
	}
};

//TODO function for a recruiter to reject an application for a job
exports.rejectApplication = async (req, res, next) => {
	try {
		const { job_id, gamer_id } = req.params;

		//update the application_state of the application
		const query = `UPDATE gamers_jobs_applicants SET application_state = 'rejected' WHERE job_id = ? AND gamer_id = ?`;
		const values = [job_id, gamer_id];

		connection.query(query, values, function (err, result) {
			if (err) {
				return next(new AppError(err.message, 400));
			}
			res.status(200).json({
				status: "success",
				message: "Gamer rejected for job successfully"
			});
		});
	} catch (err) {
		return next(new AppError(err.message, 400));
	}
};