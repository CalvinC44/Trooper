const AppError = require("../utils/appError");
const connection = require("../services/db");

exports.getAllJobs = async (req, res, next) => {
	try {
		// get all jobs
		connection.query(
			`SELECT jobs.*, GROUP_CONCAT(roles.role_name) as roles, GROUP_CONCAT(gamers_jobs_applicants.gamer_id) as applicants, GROUP_CONCAT(gamers_jobs_asked_gamers.gamer_id) as asked_gamers FROM jobs LEFT JOIN jobs_roles ON jobs.id = jobs_roles.job_id LEFT JOIN roles ON jobs_roles.role_id = roles.id LEFT JOIN gamers_jobs_applicants ON jobs.id = gamers_jobs_applicants.job_id AND gamers_jobs_applicants.application_state = 'Approved' LEFT JOIN gamers_jobs_asked_gamers ON jobs.id = gamers_jobs_asked_gamers.job_id AND gamers_jobs_asked_gamers.recruitment_state = 'Approved' GROUP BY jobs.id`,
			function (err, data, fields) {
				if (err) return next(new AppError(err));
				res.status(200).json({
					status: "success",
					length: data?.length,
					data: data
				});
			}
		);
	} catch (err) {
		return next(new AppError(err, 500));
	}
};

//function to create a job, require a job_name and the recruiter_id, others are optional, job_state is set to Available by default
exports.createJob = async (req, res, next) => {
	try {
		if (!req.body) return next(new AppError("No form data found", 404));
		if (!req.body.job_name) return next(new AppError("No job_name found"));
		if (!req.body.recruiter_id)
			return next(new AppError("No recruiter_id found"));

		let query = "INSERT INTO jobs (job_name, recruiter_id";
		let values = [req.body.job_name, req.body.recruiter_id];

		const columnMap = {
			short_description: "short_description",
			description: "description",
			game_id: "game_id",
			payment_amount: "payment_amount",
			duration: "duration",
			chosen_gamer_id: "chosen_gamer_id"
		};

		Object.keys(columnMap).forEach((key) => {
			if (req.body[key]) {
				query += `, ${columnMap[key]}`;
				values.push(req.body[key]);
			}
		});

		query += ") VALUES(?";
		for (let i = 1; i < values.length; i++) {
			query += ",?";
		}
		query += ")";

		//query to create the job
		connection.query(query, values, function (err, result) {
			if (err) return next(new AppError(err, 500));

			//get the id of the job created and return it
			connection.query(
				"SELECT id FROM jobs ORDER BY id DESC LIMIT 1",
				function (err, data, fields) {
					if (err) return next(new AppError(err, 500));
					const job_id = data[0].id;

					if (req.body.roles) {
						const roleValues = req.body.roles.map((role_id) => [
							job_id,
							role_id
						]);

						const roleQuery =
							"INSERT INTO jobs_roles (job_id, role_id) VALUES ?";
						connection.query(roleQuery, [roleValues], function (err, result) {
							if (err) return next(new AppError(err, 500));
						});
					}

					res.status(201).json({
						status: "success",
						message: "job created!",
						job_id: data[0].id
					});
				}
			);
		});
	} catch (err) {
		return next(new AppError(err, 500));
	}
};

//function to get specific job using its id
exports.getJob = async (req, res, next) => {
	try {
		if (!req.params.id) {
			return next(new AppError("No job id found", 404));
		}
		connection.query(
			"SELECT * FROM jobs WHERE id = ?",
			[req.params.id],
			function (err, data, fields) {
				if (err) return next(new AppError(err, 500));
				res.status(200).json({
					status: "success",
					length: data?.length,
					data: data
				});
			}
		);
	} catch (err) {
		return next(new AppError(err, 500));
	}
};

//function to update a job
exports.updateJob = async (req, res, next) => {
	try {
		if (!req.params.id) {
			return next(new AppError("No job id found", 404));
		}
		if (!req.body) return next(new AppError("No form data found", 404));
		let query = "UPDATE jobs SET ";
		let values = [];
		if (req.body.job_name) {
			query += "job_name = ?, ";
			values.push(req.body.job_name);
		}
		if (req.body.birthdate) {
			query += "birthdate = ?, ";
			values.push(req.body.birthdate);
		}
		if (req.body.description) {
			query += "description = ?, ";
			values.push(req.body.description);
		}
		if (req.body.location) {
			query += "location = ?, ";
			values.push(req.body.location);
		}
		query = query.slice(0, -2); // Removing the last comma and space
		query += " WHERE id = ?";
		values.push(req.params.id);
		connection.query(query, values, function (err, data, fields) {
			if (err) return next(new AppError(err, 500));
			res.status(200).json({
				status: "success",
				message: "job updated!"
			});
		});
	} catch (err) {
		return next(new AppError(err, 500));
	}
};

//function to delete a job using its id
exports.deleteJob = async (req, res, next) => {
	try {
		if (!req.params.id) {
			return next(new AppError("No job id found", 404));
		}
		connection.query(
			"DELETE FROM jobs WHERE id=?",
			[req.params.id],
			function (err, fields) {
				if (err) return next(new AppError(err, 500));
				res.status(201).json({
					status: "success",
					message: "job deleted!"
				});
			}
		);
	} catch (err) {
		return next(new AppError(err, 500));
	}
};
