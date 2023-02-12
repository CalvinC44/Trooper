const express = require("express");
const gamerControllers = require("../controllers/gamer");
const gamerMiddleware = require("../middleware/gamerMiddleware");
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
	.get(gamerControllers.getAllGamers)
	.post(gamerMiddlewareCreateOrUpdate, gamerControllers.createGamer);
router
	.route("/gamers/:id")
	.get(gamerMiddleware.updateTotalEarned, gamerControllers.getGamer)
	.put(gamerMiddlewareCreateOrUpdate, gamerControllers.updateGamer)
	.delete(gamerControllers.deleteGamer);
router.route("/gamer/id").get(gamerControllers.getGamerId);
router.route("/gamers/:id/jobs").get(gamerControllers.getGamerJobs);
module.exports = router;
