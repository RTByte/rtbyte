const { Extendable, KlasaUser } = require('klasa');

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, { appliesTo: [KlasaUser] });
	}

	async canMod(user) {
		const member = await this.guild.members.fetch(user).catch(() => null);
		return member.highestRole.position < this.highestRole.position;
	}

};