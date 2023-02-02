const express = require("express");
const gamerControllers = require("../controllers/gamer");
const jobControllers = require("../controllers/job");
const checkAttributes = require("../middleware/checkAttributes");
const router = express.Router();

//routes for gamers
router
	.route("/gamers")
	.get(gamerControllers.getAllGamers)
	.post(checkAttributes, gamerControllers.createGamer);
router
	.route("/gamers/:id")
	.get(gamerControllers.getGamer)
	.put(checkAttributes, gamerControllers.updateGamer)
	.delete(gamerControllers.deleteGamer);
router.route("/gamer/id").get(gamerControllers.getGamerId);

//routes for jobs
router
	.route("/jobs")
	.get(jobControllers.getAllJobs)
	.post(jobControllers.createJob);
router
	.route("/jobs/:id")
	.get(jobControllers.getJob)
	.put(jobControllers.updateJob)
	.delete(jobControllers.deleteJob);

module.exports = router;
