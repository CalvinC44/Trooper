const AppError = require("../utils/appError");
const connection = require("../services/db");
const { checkUserExists } = require("./gamer");

// function to get all Jobs
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

//function to create a job, require a name and the recruiter_id, others are optional, job_state is set to Available by default
exports.createJob = (req, res, next) => {
	if (!req.body) return next(new AppError("No form data found", 404));
	if (!req.body.job_name) return next(new AppError("No job_name found"));
	if (!req.body.recruiter_id)
		return next(new AppError("No recruiter_id found"));
	if (
		req.body.job_state &&
		req.body.job_state !== "Available" &&
		req.body.job_state !== "In Progress" &&
		req.body.job_state !== "Done"
	)
		return next(new AppError("Incorrect type of job_state", 400));
	if (req.body.payment_amount && req.body.payment_amount < 0)
		return next(new AppError("Incorrect payment_amount"));
	if (req.body.recruiter_id && !checkUserExists(req.body.recruiter_id))
		return next(new AppError("Recruiter doesnt exists"));
	if (req.body.chosen_gamer_id && !checkUserExists(req.body.chosen_gamer_id))
		return next(new AppError("Chosen gamer doesnt exists"));

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
};

//function to check if a user exists
exports.checkUserExists = (userId) => {
	let query = "SELECT 1 FROM gamers WHERE id = ?";
	connection.query(query, [userId], function (error, results) {
		if (error) throw error;
		if (results.length > 0) {
			return true;
		} else {
			return false;
		}
	});
};

//function to get specific job using its id
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

//function to update a job
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

//function to delete a job using its id
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
