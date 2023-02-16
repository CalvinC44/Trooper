const AppError = require("../utils/appError");
const connection = require("../services/db");
const uuidv4 = require("uuid").v4;

//function to create a job, require a job_name and the recruiter_id, others are optional, job_state is set to Available by default
exports.createJob = async (req, res, next) => {
	try {
		if (!req.body.recruiter_id) {
			return next(new AppError("No recruiter_id found", 404));
		}
		if (!req.body) return next(new AppError("No form data found", 404));
		if (!req.body.job_name) return next(new AppError("No job_name found"));
		if (!req.body.recruiter_id)
			return next(new AppError("No recruiter_id found"));

		//generate a unique job_id for the job
		const job_id = uuidv4();

		//initialize query and values, job_name and recruiter_id are required
		let query = "INSERT INTO jobs (job_id, job_name, recruiter_id";
		let values = [job_id, req.body.job_name, req.body.recruiter_id];

		//possibility to set other attributes of the job
		const columnMap = {
			short_description: "short_description",
			description: "description",
			game_id: "game_id",
			payment_amount: "payment_amount",
			duration: "duration"
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

		connection.beginTransaction(function (err) {
			if (err) {
				return next(new AppError(err, 500));
			}

			//query to create the job
			connection.query(query, values, function (err, result) {
				if (err) {
					return connection.rollback(function () {
						return next(new AppError(err, 500));
					});
				}

				if (req.body.roles_id) {
					const roleValues = req.body.roles_id.map((role_id) => [
						job_id,
						role_id
					]);
					const roleQuery = "INSERT INTO jobs_roles (job_id, role_id) VALUES ?";
					connection.query(roleQuery, [roleValues], function (err, result) {
						if (err) {
							return connection.rollback(function () {
								return next(new AppError(err, 500));
							});
						}
						connection.commit(function (err) {
							if (err) {
								return connection.rollback(function () {
									return next(new AppError(err, 500));
								});
							}
							res.status(201).json({
								status: "success",
								message: "Job created successfully",
								data: {
									job_id: job_id
								}
							});
						});
					});
				} else {
					connection.commit(function (err) {
						if (err) {
							return connection.rollback(function () {
								return next(new AppError(err, 500));
							});
						}
						res.status(201).json({
							status: "success",
							message: "Job created successfully",
							data: {
								job_id: job_id
							}
						});
					});
				}
			});
		});
	} catch (err) {
		return next(new AppError(err, 500));
	}
};

//function to get all jobs, require no parameters
exports.getAllJobs = async (req, res, next) => {
	try {
		// get all jobs
		connection.query(
			`SELECT jobs.*, 
			GROUP_CONCAT(roles.role_name) as roles, 
			GROUP_CONCAT(gamers_jobs_applications.gamer_id) as applicants, 
			GROUP_CONCAT(gamers_jobs_asked.gamer_id) as asked_gamers 
			FROM jobs 
			LEFT JOIN jobs_roles ON jobs.job_id = jobs_roles.job_id 
			LEFT JOIN roles ON jobs_roles.role_id = roles.id 
			LEFT JOIN gamers_jobs_applications ON jobs.job_id = gamers_jobs_applications.job_id
			LEFT JOIN gamers_jobs_asked ON jobs.job_id = gamers_jobs_asked.job_id
			GROUP BY jobs.job_id`,
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

//function to get specific job using its job_id
exports.getJob = async (req, res, next) => {
	try {
		if (!req.params.job_id) {
			return next(new AppError("No job job_id found", 404));
		}
		const query = `SELECT jobs.*, 
					GROUP_CONCAT(roles.role_name) as roles, 
					GROUP_CONCAT(gamers_jobs_applications.gamer_id) as applicants, 
					GROUP_CONCAT(gamers_jobs_asked.gamer_id) as asked_gamers 
					FROM jobs LEFT JOIN jobs_roles ON jobs.job_id = jobs_roles.job_id 
					LEFT JOIN roles ON jobs_roles.role_id = roles.id 
					LEFT JOIN gamers_jobs_applications ON jobs.job_id = gamers_jobs_applications.job_id
					LEFT JOIN gamers_jobs_asked ON jobs.job_id = gamers_jobs_asked.job_id
					WHERE jobs.job_id = ? GROUP BY jobs.job_id`;
		connection.query(query, [req.params.job_id], function (err, data, fields) {
			if (err) return next(new AppError(err, 500));
			res.status(200).json({
				status: "success",
				length: data?.length,
				data: data
			});
		});
	} catch (err) {
		return next(new AppError(err, 500));
	}
};

//function to update a job
exports.updateJob = async (req, res, next) => {
	try {
		if (!req.params.job_id) {
			return next(new AppError("No job job_id found", 404));
		}
		if (!req.body) return next(new AppError("No form data found", 404));

		connection.beginTransaction(function (err) {
			if (err) {
				return next(new AppError(err, 500));
			}

			if (
				req.body.job_name ||
				req.body.short_description ||
				req.body.description ||
				req.body.game_id ||
				req.body.duration
			) {
				let query = "UPDATE jobs SET ";
				let values = [];

				const columnMap = {
					job_name: "job_name",
					short_description: "short_description",
					description: "description",
					game_id: "game_id",
					duration: "duration"
				};

				Object.keys(columnMap).forEach((key) => {
					if (req.body[key]) {
						query += `${columnMap[key]} = ?, `;
						values.push(req.body[key]);
					}
				});

				query = query.slice(0, -2);
				query += " WHERE job_id=?";
				values.push(req.params.job_id);

				//query to update the job details, if there are any
				connection.query(query, values, function (err, result) {
					if (err) {
						return connection.rollback(function () {
							return next(new AppError(err, 500));
						});
					}
				});
			}

			if (req.body.roles_id) {
				//query to delete all the roles of the job
				connection.query(
					"DELETE FROM jobs_roles WHERE job_id = ?",
					[req.params.job_id],
					function (err, result) {
						if (err) {
							return connection.rollback(function () {
								return next(new AppError(err, 500));
							});
						}
					}
				);

				//query to insert the new roles of the job if any
				if (req.body.roles_id.length > 0) {
					const roleValues = req.body.roles_id.map((role_id) => [
						req.params.job_id,
						role_id
					]);
					const roleQuery = `INSERT INTO jobs_roles (job_id, role_id) VALUES ?`;
					connection.query(roleQuery, [roleValues], function (err, result) {
						if (err) {
							return connection.rollback(function () {
								return next(new AppError(err, 500));
							});
						}
					});
				}
			}

			connection.commit(function (err) {
				if (err) {
					return connection.rollback(function () {
						return next(new AppError(err, 500));
					});
				}
				res.status(200).json({
					status: "success",
					message: "Job updated successfully"
				});
			});
		});
	} catch (err) {
		return next(new AppError(err, 500));
	}
};

//function to delete a job using its job_id
exports.deleteJob = async (req, res, next) => {
	try {
		if (!req.params.job_id) {
			return next(new AppError("No job job_id found", 404));
		}

		connection.beginTransaction(function (err) {
			if (err) {
				return next(new AppError(err, 500));
			}

			//query to delete the job's roles
			connection.query(
				"DELETE FROM jobs_roles WHERE job_id = ?",
				[req.params.job_id],
				function (err, result) {
					if (err) {
						return connection.rollback(function () {
							return next(new AppError(err, 500));
						});
					}
				}
			);

			connection.query(
				"DELETE FROM jobs WHERE job_id=?",
				[req.params.job_id],
				function (err, fields) {
					if (err) return next(new AppError(err, 500));
					res.status(204).json({
						status: "success",
						message: "job deleted!"
					});
				}
			);

			connection.commit(function (err) {
				if (err) {
					return connection.rollback(function () {
						return next(new AppError(err, 500));
					});
				}
			});
		});
	} catch (err) {
		return next(new AppError(err, 500));
	}
};

//function to delete the chosen_gamer_id from the job
exports.deleteChosenGamer = async (req, res, next) => {
	try {
		if (!req.params.job_id) {
			return next(new AppError("No job job_id found", 404));
		}

		connection.beginTransaction(function (err) {
			if (err) {
				return next(new AppError(err, 500));
			}

			//query to delete the chosen_gamer_id from the job
			connection.query(
				"UPDATE jobs SET chosen_gamer_id = NULL WHERE job_id=?",
				[req.params.job_id],
				function (err, fields) {
					if (err) return next(new AppError(err, 500));
					res.status(201).json({
						status: "success",
						message: "Chosen gamer deleted!"
					});
				}
			);

			//query to update the job_state of the job to 'Available'
			connection.query(
				"UPDATE jobs SET job_state = 'Available' WHERE job_id=?",
				[req.params.job_id],
				function (err, fields) {
					if (err) return next(new AppError(err, 500));
				}
			);

			//check if there is an application from the chosen gamer
			connection.query(
				"SELECT * FROM gamers_jobs_applications WHERE job_id=? AND chosen_gamer_id=?",
				[req.params.job_id, req.body.chosen_gamer_id],
				function (err, fields) {
					if (err) return next(new AppError(err, 500));
					if (fields.length > 0) {
						//update the application state of the chosen gamer to 'Rejected' if there is an application from the chosen gamer
						connection.query(
							"UPDATE gamers_jobs_applications SET application_state = 'Rejected' WHERE job_id=? AND chosen_gamer_id=?",
							[req.params.job_id, req.body.chosen_gamer_id],
							function (err, fields) {
								if (err) return next(new AppError(err, 500));
							}
						);
					}
				}
			);

			//check if there is a job asked to the chosen gamer
			connection.query(
				"SELECT * FROM gamers_jobs_asked WHERE job_id=? AND chosen_gamer_id=?",
				[req.params.job_id, req.body.chosen_gamer_id],
				function (err, fields) {
					if (err) return next(new AppError(err, 500));
					if (fields.length > 0) {
						//update the asked state of the chosen gamer to 'Rejected' if there is a job asked to the chosen gamer
						connection.query(
							"UPDATE gamers_jobs_asked SET recruitment_state = 'Rejected' WHERE job_id=? AND chosen_gamer_id=?",
							[req.params.job_id, req.body.chosen_gamer_id],
							function (err, fields) {
								if (err) return next(new AppError(err, 500));
							}
						);
					}
				}
			);

			connection.commit(function (err) {
				if (err) {
					return connection.rollback(function () {
						return next(new AppError(err, 500));
					});
				}
			});
		});
	} catch (err) {
		return next(new AppError(err, 500));
	}
};
