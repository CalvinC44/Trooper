const User = require("./user");

class Gamer extends User {
	constructor(id, name, game) {
		super(id, name);
		this.game = game;
	}
}

module.exports = Gamer;
