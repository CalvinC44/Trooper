const express = require("express");
const app = express();
const bodyParser = require("body-parser");

app.use(bodyParser.json());

// Initialize some gamers, recruiters, and jobs
const gamers = [new Gamer(1, "John", "Overwatch")];
const recruiters = [new Recruiter(1, "Jane", "Acme Inc.")];
const jobs = [
	new Job(
		1,
		"Software Engineer",
		"Acme Inc.",
		"We are looking for a talented software engineer to join our team."
	)
];

// GET route for retrieving a list of gamers
app.get("/gamers", (req, res) => {
	res.send(gamers);
});

// POST route for creating a new gamer
app.post("/gamers", (req, res) => {
	const gamer = new Gamer(gamers.length + 1, req.body.name, req.body.game);
	gamers.push(gamer);
	res.send(gamer);
});

// GET route for retrieving a list of recruiters
app.get("/recruiters", (req, res) => {
	res.send(recruiters);
});

// POST route for creating a new recruiter
app.post("/recruiters", (req, res) => {
	const recruiter = new Recruiter(
		recruiters.length + 1,
		req.body.name,
		req.body.company
	);
	recruiters.push(recruiter);
	res.send(recruiter);
});

// GET route for retrieving a list of jobs
app.get("/jobs", (req, res) => {
	res.send(jobs);
});

// POST route for creating a new job
app.post("/jobs", (req, res) => {
	const job = new Job(
		jobs.length + 1,
		req.body.title,
		req.body.company,
		req.body.description
	);
	jobs.push(job);
	res.send(job);
});

// POST route for applying to a job
app.post("/jobs/:id/apply", (req, res) => {
	const jobId = req.params.id;
	const gamer = req.body;
	// Find the job
	const job = jobs.find((j) => j.id == jobId);
	if (!job) {
		return res.status(404).send("Job not found");
	}
	// Add gamer to the list of applicants for the job
	job.apply(gamer);
	res.send(job);
});

// POST route for approving an applicant for a job
app.post("/jobs/:id/approve", (req, res) => {
	const jobId = req.params.id;
	const gamer = req.body;
	// Find the job
	const job = jobs.find((j) => j.id == jobId);
	if (!job) {
		return res.status(404).send("Job not found");
	}
	// Accept the gamer for the job
	job.accept(gamer);
	res.send(job);
});

app.listen(3000, () => {
	console.log("Server listening on port 3000");
});
