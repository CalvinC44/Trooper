const express = require("express");
const router = express.Router();
const {
	getGamerJobsApplications,
	getJobApplications,
	applyForJob,
	approveApplication,
	rejectApplication,
	deleteApplication
} = require("../controllers/gamer-job-applicant.js");

//middleware import

//routes for gamers applications
router.route("/applications/gamer/:gamer_id").get(getGamerJobsApplications);

router
	.route("/applications/gamer/:gamer_id/job/:job_id")
	.post(applyForJob)
	.delete(deleteApplication);

//routes for jobs applications to be handled by the job recruiter
router.route("/applications/job/:job_id").get(getJobApplications);

router
	.route("/applications/job/:job_id/gamer/:gamer_id/approve")
	.put(approveApplication);
router
	.route("/applications/job/:job_id/gamer/:gamer_id/reject")
	.put(rejectApplication);

module.exports = router;
