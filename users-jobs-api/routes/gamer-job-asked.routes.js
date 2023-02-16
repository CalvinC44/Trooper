const express = require("express");
const router = express.Router();
const {
	getGamerJobsAsked,
	askGamerForJob,
	deleteJobAsked,
	getJobAskedGamers,
	approveJobAsked,
	rejectJobAsked
} = require("../controllers/gamer-job-asked.js");

//midlleware import

//routes for recruiters asking gamers for jobs
router.route("/asked/gamer/:gamer_id").get(getJobAskedGamers);

router
	.route("/asked/gamer/:gamer_id/job/:job_id")
	.post(askGamerForJob)
	.delete(deleteJobAsked);

//routes for gamers being asked for jobs by recruiters
router.route("/asked/job/:job_id").get(getGamerJobsAsked);

router.route("/asked/job/:job_id/gamer/:gamer_id/approve").put(approveJobAsked);
router.route("/asked/job/:job_id/gamer/:gamer_id/reject").put(rejectJobAsked);

module.exports = router;
