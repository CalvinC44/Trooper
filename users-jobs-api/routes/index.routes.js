const express = require("express");
const gamerControllers = require("../controllers/gamer");
const jobControllers = require("../controllers/job");
const gamerMiddleware = require("../middleware/gamerMiddleware");
const jobMiddleware = require("../middleware/jobMiddleware");
const router = express.Router();

//middleware for gamers creation and update
const gamerMiddlewareCreateOrUpdate = [
	gamerMiddleware.checkUsername,
	gamerMiddleware.checkProfileType,
	gamerMiddleware.checkBirthdateFormat,
	gamerMiddleware.checkMinHourRate,
	gamerMiddleware.checkHoursPerDay,
	gamerMiddleware.checkGamesExist,
	gamerMiddleware.checkRolesExist
];
//routes for gamers
router
	.route("/gamers")
	.get(gamerMiddleware.updateTotalEarned, gamerControllers.getAllGamers)
	.post(gamerMiddlewareCreateOrUpdate, gamerControllers.createGamer);
router
	.route("/gamers/:id")
	.get(gamerControllers.getGamer)
	.put(gamerMiddlewareCreateOrUpdate, gamerControllers.updateGamer)
	.delete(gamerControllers.deleteGamer);
router.route("/gamer/id").get(gamerControllers.getGamerId);

//middleware for jobs creation and update
const jobMiddlewareCreate = [
	jobMiddleware.checkGameJobExists,
	jobMiddleware.checkJobState,
	jobMiddleware.checkPaymentAmount,
	jobMiddleware.checkDuration,
	jobMiddleware.checkRecruiterExists,
	jobMiddleware.checkChosenGamerExists,
	jobMiddleware.checkRolesExist
];

const jobMiddlewareUpdate = [
	jobMiddleware.checkJobExists,
	jobMiddleware.checkGameJobExists,
	jobMiddleware.checkJobState,
	jobMiddleware.checkPaymentAmount,
	jobMiddleware.checkDuration,
	jobMiddleware.checkRecruiterExists,
	jobMiddleware.checkChosenGamerExists,
	jobMiddleware.checkRolesExist
];

//routes for jobs
router
	.route("/jobs")
	.get(jobControllers.getAllJobs)
	.post(jobMiddlewareCreate, jobControllers.createJob);
router
	.route("/jobs/:id")
	.get(jobControllers.getJob)
	.put(jobMiddlewareUpdate, jobControllers.updateJob)
	.delete(jobControllers.deleteJob);

module.exports = router;
