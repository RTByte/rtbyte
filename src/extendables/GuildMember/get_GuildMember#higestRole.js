const { Extendable } = require('klasa');

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, {
			name: 'highestRole',
			enabled: true,
			appliesTo: ['GuildMember'],
			klasa: false
		});
	}

	get extend() {
		return this.roles.highest ? this.roles.highest : this.guild.defaultRole;
	}

};

// Because freaking GuildMemberRoleStore#highest returns undefined if it's @everyone
