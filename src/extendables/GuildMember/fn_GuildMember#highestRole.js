const { Extendable, KlasaUser } = require('klasa');

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, { appliesTo: [KlasaUser] });
	}

	get highestRole() {
		return this.roles.highest ? this.roles.highest : this.guild.defaultRole;
	}

};

// Because freaking GuildMemberRoleStore#highest returns undefined if it's @everyone
