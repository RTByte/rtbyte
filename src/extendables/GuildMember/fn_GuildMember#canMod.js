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
		return member.highestRole.position < this.highestRole.position;
	}

};
