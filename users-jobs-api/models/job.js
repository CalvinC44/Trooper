class Job {
	constructor(id, title, company, description) {
		this.id = id;
		this.title = title;
		this.company = company;
		this.description = description;
		this.applicants = [];
		this.state = "Available";
		this.gamer = null;
	}

	apply(gamer) {
		this.applicants.push(gamer);
	}

	accept(gamer) {
		this.state = "In progress";
		this.gamer = gamer;
	}
}

module.exports = Job;
