const express = require("express");
const gamerControllers = require("../controllers/gamer");
const jobControllers = require("../controllers/job");
const {
	checkUsername,
	checkProfileType,
	checkBirthdateFormat,
	checkMinHourRate,
	checkHoursPerDay
} = require("../middleware/gamerMiddleware");
const checkAttributesJob = require("../middleware/checkAttributesJob");
const router = express.Router();

//routes for gamers
const gamerMiddleware = [
	checkUsername,
	checkProfileType,
	checkBirthdateFormat,
	checkMinHourRate,
	checkHoursPerDay
];
router
	.route("/gamers")
	.get(gamerControllers.getAllGamers)
	.post(gamerMiddleware, gamerControllers.createGamer);
router
	.route("/gamers/:id")
	.get(gamerControllers.getGamer)
	.put(gamerMiddleware, gamerControllers.updateGamer)
	.delete(gamerControllers.deleteGamer);
router.route("/gamer/id").get(gamerControllers.getGamerId);

//routes for jobs
router
	.route("/jobs")
	.get(jobControllers.getAllJobs)
	.post(checkAttributesJob, jobControllers.createJob);
router
	.route("/jobs/:id")
	.get(jobControllers.getJob)
	.put(checkAttributesJob, jobControllers.updateJob)
	.delete(jobControllers.deleteJob);

module.exports = router;
