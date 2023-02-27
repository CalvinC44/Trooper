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
const {
	checkApplicantIdExists,
	checkJobIdExists,
	checkDuplicateApplication,
	checkApplicationExists,
	checkApplicationApproved,
	checkApplicationRejected
} = require("../middleware/gamer-job-applicantMiddleware.js");

//routes for gamers applications
router
	.route("/applications/gamer")
	.get(checkApplicantIdExists, getGamerJobsApplications); //for the gamer to get all their applications

router
	.route("/applications/job/:job_id")
	.post(
		[checkApplicantIdExists, checkJobIdExists, checkDuplicateApplication],
		applyForJob
	) //for the gamer to apply for a job
	.delete(
		[
			checkApplicationExists,
			checkApplicationApproved,
			checkApplicationRejected
		],
		deleteApplication
	) //for the gamer to delete an application
	.get(getJobApplications); //for the recruiter to all the applications for a job

//routes for recruiters to approve or reject applications
router
	.route("/applications/job/:job_id/gamer/:gamer_id/approve")
	.put([checkApplicationExists, checkApplicationApproved], approveApplication);
router
	.route("/applications/job/:job_id/gamer/:gamer_id/reject")
	.put(
		[
			checkApplicationExists,
			checkApplicationApproved,
			checkApplicationRejected
		],
		rejectApplication
	);

module.exports = router;
