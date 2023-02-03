const AppError = require("../utils/appError");
const connection = require("../services/db");

// function to get all Jobs
exports.getAllJobs = async (req, res, next) => {
	try {
		connection.query("SELECT * FROM jobs", function (err, data, fields) {
			if (err) return next(new AppError(err));
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

//function to create a job, require a name and the recruiter_id, others are optional, job_state is set to Available by default
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
			gamer_id: "gamer_id"
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
		console.log(query);

		connection.query(query, values, function (err, result) {
			if (err) return next(new AppError(err, 500));
			res.status(201).json({
				status: "success",
				message: "job created!",
				data: result
			});
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
