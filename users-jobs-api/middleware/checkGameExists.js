const connection = require("../services/db");

//function to check if a user exists
async function checkGameExists(userId) {
	return new Promise((resolve, reject) => {
		connection.query(
			"SELECT 1 FROM games WHERE id = ?",
			[userId],
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

module.exports = checkGameExists;
