const connection = require("../services/db");

// function to check if the role exists
async function checkRoleExists(roleId) {
	return new Promise((resolve, reject) => {
		connection.query(
			"SELECT 1 FROM roles WHERE id = ?",
			[roleId],
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

module.exports = checkRoleExists;
