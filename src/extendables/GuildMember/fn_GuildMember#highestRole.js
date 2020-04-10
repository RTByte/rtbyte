const { Extendable } = require('klasa');
const { GuildMember } = require('discord.js');

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, { appliesTo: [GuildMember] });
	}

	get highestRole() {
		return this.roles.highest ? this.roles.highest : this.guild.id;
	}

};

// Because freaking GuildMemberRoleStore#highest returns undefined if it's @everyone
