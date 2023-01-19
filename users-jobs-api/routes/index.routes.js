const express = require("express");
const controllers = require("../controllers/gamer");
const router = express.Router();

router
	.route("/gamers")
	.get(controllers.getAllGamers)
	.post(controllers.createGamer);
router
	.route("/gamers/:id")
	.get(controllers.getGamer)
	.put(controllers.updateGamer)
	.delete(controllers.deleteGamer);
router.route("/gamer/id").get(controllers.getGamerId);
module.exports = router;
