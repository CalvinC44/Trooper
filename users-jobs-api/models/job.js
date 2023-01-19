const JobState = {
	AVAILABLE: "Available",
	IN_PROGRESS: "In progress",
	DONE: "Done"
};

class Job {
	constructor(id, title, company, description) {
		this.id = id;
		this.title = title;
		this.company = company;
		this.description = description;
		this.applicants = [];
		this._state = "Available";
		this.gamer = null;
	}

	set state(state) {
		if (
			state !== JobState.AVAILABLE &&
			state !== JobState.IN_PROGRESS &&
			state !== JobState.DONE
		) {
			throw new Error("Invalid state");
		}
		this._state = state;
	}

	get state() {
		return this._state;
	}

	apply(gamer) {
		this.applicants.push(gamer);
	}

	accept(gamer) {
		this.state = JobState.IN_PROGRESS;
		this.gamer = gamer;
	}
}

module.exports = Job;
