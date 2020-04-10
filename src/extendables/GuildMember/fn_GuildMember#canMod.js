const { Extendable } = require('klasa');
const { GuildMember } = require('discord.js');

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, { appliesTo: [GuildMember] });
	}

	async canMod(user) {
		const member = await this.guild.members.fetch(user).catch(() => null);
		return member.roles.cache.highest ? member.roles.cache.highest.position < this.roles.cache.highest.position : true;
	}

};
