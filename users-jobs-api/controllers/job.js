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

		const job_id = uuidv4();
		let query = "INSERT INTO jobs (id, job_name, recruiter_id";
		let values = [job_id, req.body.job_name, req.body.recruiter_id];

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

		if (req.body.chosen_gamer_id) {
			query += `, job_state`;
			values.push("In progress");
		}

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

				if (req.body.roles) {
					const roleValues = req.body.roles.map((role_id) => [job_id, role_id]);
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
			GROUP_CONCAT(gamers_jobs_applicants.gamer_id) as applicants, 
			GROUP_CONCAT(gamers_jobs_asked_gamers.gamer_id) as asked_gamers 
			FROM jobs 
			LEFT JOIN jobs_roles ON jobs.id = jobs_roles.job_id 
			LEFT JOIN roles ON jobs_roles.role_id = roles.id 
			LEFT JOIN gamers_jobs_applicants ON jobs.id = gamers_jobs_applicants.job_id 
			AND gamers_jobs_applicants.application_state = 'Approved' 
			LEFT JOIN gamers_jobs_asked_gamers ON jobs.id = gamers_jobs_asked_gamers.job_id 
			AND gamers_jobs_asked_gamers.recruitment_state = 'Approved' 
			GROUP BY jobs.id`,
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

//function to get specific job using its id
exports.getJob = async (req, res, next) => {
	try {
		if (!req.params.id) {
			return next(new AppError("No job id found", 404));
		}
		const query = `SELECT jobs.*, 
					GROUP_CONCAT(roles.role_name) as roles, 
					GROUP_CONCAT(gamers_jobs_applicants.gamer_id) as applicants, 
					GROUP_CONCAT(gamers_jobs_asked_gamers.gamer_id) as asked_gamers 
					FROM jobs LEFT JOIN jobs_roles ON jobs.id = jobs_roles.job_id 
					LEFT JOIN roles ON jobs_roles.role_id = roles.id 
					LEFT JOIN gamers_jobs_applicants ON jobs.id = gamers_jobs_applicants.job_id 
					AND gamers_jobs_applicants.application_state = 'Approved' 
					LEFT JOIN gamers_jobs_asked_gamers ON jobs.id = gamers_jobs_asked_gamers.job_id 
					AND gamers_jobs_asked_gamers.recruitment_state = 'Approved' 
					WHERE jobs.id = ? GROUP BY jobs.id`;
		connection.query(query, [req.params.id], function (err, data, fields) {
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
		if (!req.params.id) {
			return next(new AppError("No job id found", 404));
		}
		if (!req.body) return next(new AppError("No form data found", 404));

		//query to update the job details, if there are any
		if (
			req.body.job_name ||
			req.body.short_description ||
			req.body.description ||
			req.body.game_id ||
			req.body.payment_amount ||
			req.body.duration ||
			req.body.chosen_gamer_id
		) {
			let query = "UPDATE jobs SET ";
			let values = [];

			const columnMap = {
				job_name: "job_name",
				short_description: "short_description",
				description: "description",
				game_id: "game_id",
				payment_amount: "payment_amount",
				duration: "duration",
				chosen_gamer_id: "chosen_gamer_id"
			};

			Object.keys(columnMap).forEach((key) => {
				if (req.body[key]) {
					query += `${columnMap[key]} = ?, `;
					values.push(req.body[key]);
				}
			});

			if (req.body.chosen_gamer_id) {
				query += `job_state = ?, `;
				values.push("In progress");
			}

			query = query.slice(0, -2);
			query += " WHERE id=?";
			values.push(req.params.id);

			connection.beginTransaction(function (err) {
				if (err) {
					return next(new AppError(err, 500));
				}

				//query to update the job details, if there are any
				connection.query(query, values, function (err, result) {
					if (err) {
						return connection.rollback(function () {
							return next(new AppError(err, 500));
						});
					}

					if (req.body.roles) {
						const roleValues = req.body.roles.map((role_id) => [
							req.params.id,
							role_id
						]);
						const roleQuery =
							"INSERT INTO jobs_roles (job_id, role_id) VALUES ?";

						//query to delete the roles of the job
						connection.query(
							"DELETE FROM jobs_roles WHERE job_id=?",
							req.params.id,
							function (err, result) {
								if (err) {
									console.log("DELETE roles");
									return connection.rollback(function () {
										return next(new AppError(err, 500));
									});
								}
							}
						);

						//query to update the roles for the job
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
								res.status(200).json({
									status: "success",
									message: "Job updated successfully"
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
							res.status(200).json({
								status: "success",
								message: "Job updated successfully"
							});
						});
					}
				});
			});
			//else if no job details, update the roles
		} else {
			const roleValues = req.body.roles.map((role_id) => [
				req.params.id,
				role_id
			]);
			const roleQuery = "INSERT INTO jobs_roles (job_id, role_id) VALUES ?";

			//query to delete the roles of the job
			connection.query(
				"DELETE FROM jobs_roles WHERE job_id=?",
				req.params.id,
				function (err, result) {
					if (err) {
						console.log("DELETE roles");
						return connection.rollback(function () {
							return next(new AppError(err, 500));
						});
					}
				}
			);

			//query to update the roles for the job
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
					res.status(200).json({
						status: "success",
						message: "Job updated successfully"
					});
				});
			});
		}
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
