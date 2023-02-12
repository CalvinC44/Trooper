const connection = require("../services/db");

// function to check if the job exists
async function checkJobExists(jobId) {
	return new Promise((resolve, reject) => {
		connection.query(
			"SELECT 1 FROM jobs WHERE id = ?",
			[jobId],
			(err, data, fields) => {
				if (err) {
					reject(err);
				} else {
					if (data.length > 0) {
						resolve(true);
					} else {
						resolve(false);
					}
				}
			}
		);
	});
}

module.exports = checkJobExists;
