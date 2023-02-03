const connection = require("../services/db");

//function to check if a user exists
async function checkUserExists(userId) {
	try {
		connection.query(
			"SELECT 1 FROM gamers WHERE id = ?",
			[userId],
			function (err, data, fields) {
				if (err) return next(new AppError(err));
				if (data.length > 0) {
					return true;
				} else {
					return false;
				}
			}
		);
	} catch (err) {
		return next(new AppError(err, 500));
	}
}

module.exports = checkUserExists;
