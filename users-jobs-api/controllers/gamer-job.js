//function to get total_earned, if null does the request and save it
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
					"SELECT SUM(payment_amount) AS total_earned FROM jobs WHERE gamer_id = ?",
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

//function to make a gamer apply for a job

//function to make a gamer accept a job a recruiter asks him

//function for a recruiter to accept an applicant for a job

//function for a recruiter to ask a gamer for a job
