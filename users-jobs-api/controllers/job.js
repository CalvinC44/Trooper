const AppError = require("../utils/appError");
const connection = require("../services/db");

exports.getAllJobs = (req, res, next) => {
	connection.query("SELECT * FROM jobs", function (err, data, fields) {
		if (err) return next(new AppError(err));
		res.status(200).json({
			status: "success",
			length: data?.length,
			data: data
		});
	});
};

exports.createJob = (req, res, next) => {
	if (!req.body) return next(new AppError("No form data found", 404));
	const values = [req.body.job_name];
	connection.query(
		"INSERT INTO jobs (job_name) VALUES(?)",
		[values],
		function (err, data, fields) {
			if (err) return next(new AppError(err, 500));
			res.status(201).json({
				status: "success",
				message: "job created!"
			});
		}
	);
};

exports.getJob = (req, res, next) => {
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
};

exports.updateJob = (req, res, next) => {
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
};

exports.deleteJob = (req, res, next) => {
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
};
