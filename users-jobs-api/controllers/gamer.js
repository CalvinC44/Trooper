const AppError = require("../utils/appError");
const connection = require("../services/db");
const uuidv4 = require("uuid").v4;

// function to create gamer, require username, others are optional
exports.createGamer = async (req, res, next) => {
	try {
		if (!req.body) return next(new AppError("No form data found", 404));
		if (!req.body.username) return next(new AppError("No username found", 404));

		//generate a unique id for the gamer
		const gamer_id = uuidv4();

		//initialize query and values, username is required
		let query = "INSERT INTO gamers (id, username";
		let values = [gamer_id, req.body.username];

		//possibility to set other attributes of the gamer
		const columnMap = {
			profile_type: "profile_type",
			location: "location",
			birthdate: "birthdate",
			description: "description",
			name_discord: "name_discord",
			link_twitter: "link_twitter",
			link_linkedin: "link_linkedin",
			link_facebook: "link_facebook",
			min_hour_rate: "min_hour_rate",
			hours_per_day: "hours_per_day"
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

		//connect to database
		connection.beginTransaction(function (err) {
			if (err) return next(new AppError(err, 500));

			//query to insert gamer
			connection.query(query, values, function (err, result) {
				if (err) {
					connection.rollback(function () {
						return next(new AppError(err, 500));
					});
				}

				//insert favorite games if any
				if (req.body.favorite_games_id) {
					query = "INSERT INTO gamers_games (gamer_id, game_id) VALUES";
					let values = [];
					req.body.favorite_games_id.forEach((game) => {
						query += "(?,?),";
						values.push(gamer_id);
						values.push(game);
					});
					query = query.slice(0, -1);

					connection.query(query, values, function (err, result) {
						if (err) {
							connection.rollback(function () {
								return next(new AppError(err, 500));
							});
						}
					});
				}

				//insert favorite roles if any
				if (req.body.favorite_roles_id) {
					query = "INSERT INTO gamers_roles (gamer_id, role_id) VALUES";
					let values = [];
					req.body.favorite_roles_id.forEach((role) => {
						query += "(?,?),";
						values.push(gamer_id);
						values.push(role);
					});
					query = query.slice(0, -1);

					connection.query(query, values, function (err, result) {
						if (err) {
							connection.rollback(function () {
								return next(new AppError(err, 500));
							});
						}
					});
				}

				connection.commit(function (err) {
					if (err) {
						connection.rollback(function () {
							return next(new AppError(err, 500));
						});
					}
					res.status(201).json({
						status: "success",
						message: "Gamer created successfully",
						data: {
							id: gamer_id
						}
					});
				});
			});
		});
	} catch (err) {
		return next(new AppError(err, 500));
	}
};

//function to get all gamers
//TODO: add pagination ? and select only username and id, roles, games
exports.getAllGamers = async (req, res, next) => {
	try {
		//query to get all gamers and their favorite games and roles
		connection.query(
			`SELECT gamers.*,
			GROUP_CONCAT(DISTINCT games.game_name SEPARATOR ', ') AS favorite_games,
			GROUP_CONCAT(DISTINCT roles.role_name SEPARATOR ', ') AS favorite_roles
			FROM gamers
			LEFT JOIN gamers_games ON gamers.id = gamers_games.gamer_id
			LEFT JOIN gamers_roles ON gamers.id = gamers_roles.gamer_id
			LEFT JOIN games ON gamers_games.game_id = games.id
			LEFT JOIN roles ON gamers_roles.role_id = roles.id
			GROUP BY gamers.id`,
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

//function to get a gamer's id using its username
exports.getGamerId = async (req, res, next) => {
	try {
		if (!req.body.username)
			return next(new AppError("No gamer username found", 404));
		connection.query(
			"SELECT id FROM gamers WHERE username = ?",
			[req.body.username],
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

//function to get a gamer using its id
exports.getGamer = async (req, res, next) => {
	try {
		if (!req.params.id) return next(new AppError("No gamer id found", 404));
		connection.query(
			"SELECT * FROM gamers WHERE id = ?",
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

//function to update a gamer
exports.updateGamer = async (req, res, next) => {
	try {
		if (!req.params.id || !req.body || Object.keys(req.body).length === 0) {
			return next(new AppError("No gamer id or form data found", 404));
		}

		connection.beginTransaction(function (err) {
			if (err) {
				return next(new AppError(err, 500));
			}

			if (
				req.body.username ||
				req.body.profile_type ||
				req.body.birthdate ||
				req.body.description ||
				req.body.location ||
				req.body.name_discord ||
				req.body.link_twitter ||
				req.body.link_linkedin ||
				req.body.link_facebook ||
				req.body.min_hour_rate ||
				req.body.hours_per_day
			) {
				//initiate query and values
				let query = "UPDATE gamers SET ";
				let values = [];

				const columnMap = {
					username: "username",
					profile_type: "profile_type",
					birthdate: "birthdate",
					description: "description",
					location: "location",
					birthdate: "birthdate",
					description: "description",
					name_discord: "name_discord",
					link_twitter: "link_twitter",
					link_linkedin: "link_linkedin",
					link_facebook: "link_facebook",
					min_hour_rate: "min_hour_rate",
					hours_per_day: "hours_per_day"
				};

				Object.keys(columnMap).forEach((key) => {
					if (req.body[key]) {
						query += `${columnMap[key]} = ?, `;
						values.push(req.body[key]);
					}
				});

				query = query.slice(0, -2); // Removing the last comma and space
				query += " WHERE id = ?";
				values.push(req.params.id);
				// update gamer info
				connection.query(query, values, function (err, result) {
					if (err) {
						return connection.rollback(function () {
							return next(new AppError(err, 500));
						});
					}
				});
			}

			if (req.body.favorite_games_id) {
				// delete existing favorite games for the gamer
				connection.query(
					"DELETE FROM gamers_games WHERE gamer_id = ?",
					[req.params.id],
					function (err, result) {
						if (err) {
							return connection.rollback(function () {
								return next(new AppError(err, 500));
							});
						}
					}
				);

				// add the new favorite games for the gamer for each game if any
				if (req.body.favorite_games_id.length > 0) {
					const gameValues = req.body.favorite_games_id.map((game_id) => [
						req.params.id,
						game_id
					]);
					const gameQuery =
						"INSERT INTO gamers_games (gamer_id, game_id) VALUES ?";
					connection.query(gameQuery, [gameValues], function (err, result) {
						if (err) {
							return connection.rollback(function () {
								return next(new AppError(err, 500));
							});
						}
					});
				}
			}

			if (req.body.favorite_roles_id) {
				// delete existing favorite roles for the gamer
				connection.query(
					"DELETE FROM gamers_roles WHERE gamer_id = ?",
					[req.params.id],
					function (err, result) {
						if (err) {
							return connection.rollback(function () {
								return next(new AppError(err, 500));
							});
						}
					}
				);

				// add the new favorite roles for the gamer if any
				if (req.body.favorite_roles_id.length > 0) {
					const roleValues = req.body.favorite_roles_id.map((role_id) => [
						req.params.id,
						role_id
					]);
					const roleQuery =
						"INSERT INTO gamers_roles (gamer_id, role_id) VALUES ?";
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
					message: "gamer updated!"
				});
			});
		});
	} catch (err) {
		return next(new AppError(err, 500));
	}
};

//function to delete a gamer using its id
exports.deleteGamer = async (req, res, next) => {
	try {
		if (!req.params.id) {
			return next(new AppError("No gamer id found", 404));
		}
		connection.beginTransaction(function (err) {
			if (err) {
				return next(new AppError(err, 500));
			}

			//first delete the games and roles associated with the gamer
			connection.query(
				"DELETE FROM gamers_games WHERE gamer_id=?",
				[req.params.id],
				function (err, result) {
					if (err) {
						return connection.rollback(function () {
							return next(new AppError(err, 500));
						});
					}
				}
			);

			connection.query(
				"DELETE FROM gamers_roles WHERE gamer_id=?",
				[req.params.id],
				function (err, result) {
					if (err) {
						return connection.rollback(function () {
							return next(new AppError(err, 500));
						});
					}
				}
			);

			//then delete the gamer
			connection.query(
				"DELETE FROM gamers WHERE id=?",
				[req.params.id],
				function (err, result) {
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
						res.status(204).json({
							status: "success",
							message: "gamer deleted!"
						});
					});
				}
			);
		});
	} catch (err) {
		return next(new AppError(err, 500));
	}
};

//function to get total_earned of a gamer, if null does the request and save it
exports.getTotalEarned = (req, res, next) => {
	if (!req.params.id) {
		return next(new AppError("No gamer id found", 404));
	}
	connection.query(
		"SELECT total_earned FROM gamers WHERE id = ?",
		[req.params.id],
		function (err, data, fields) {
			if (err) return next(new AppError(err, 500));
			if (data[0].total_earned === null) {
				connection.query(
					"SELECT SUM(payment_amount) AS total_earned FROM jobs WHERE chosen_gamer_id = ?",
					[req.params.id],
					function (err, data, fields) {
						if (err) return next(new AppError(err, 500));
						connection.query(
							"UPDATE gamers SET total_earned = ? WHERE id = ?",
							[data[0].total_earned, req.params.id],
							function (err, data, fields) {
								if (err) return next(new AppError(err, 500));
								res.status(200).json({
									status: "success",
									length: data?.length,
									data: data
								});
							}
						);
					}
				);
			} else {
				res.status(200).json({
					status: "success",
					length: data?.length,
					data: data
				});
			}
		}
	);
};

//function to get all the jobs of a gamer
exports.getGamerJobs = (req, res, next) => {
	if (!req.params.id) {
		return next(new AppError("No gamer id found", 404));
	}
	connection.query(
		"SELECT * FROM jobs WHERE chosen_gamer_id = ?",
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
};
