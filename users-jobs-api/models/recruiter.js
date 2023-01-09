const User = require("./user");

class Recruiter extends User {
	constructor(id, name, company) {
		super(id, name);
		this.company = company;
	}
}

module.exports = Recruiter;
