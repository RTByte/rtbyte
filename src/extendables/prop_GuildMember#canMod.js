const { Extendable } = require('klasa');

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, {
			name: 'canMod',
			enabled: true,
			appliesTo: ['GuildMember'],
			klasa: false
		});
	}

	async extend(user) {
		const member = await this.guild.members.fetch(user).catch(() => null);
		if (!member.roles.length) return true;
		if (member.roles.highest.position < this.roles.highest.position) return true;
		if (!member.bannable) return false;

		return false;
	}

};
