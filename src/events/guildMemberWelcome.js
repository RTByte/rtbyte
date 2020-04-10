const { Event } = require('klasa');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'guildMemberWelcome' });
	}

	async run(member) {
		if (!member.guild.settings.greetings.welcomeMessage) return;

		const welcomeChannel = await this.client.channels.get(member.guild.settings.greetings.welcomeChannel);
		let welcomeMsg = member.guild.settings.greetings.welcomeMessage;

		if (member.guild.settings.greetings.welcomeMessage) {
			welcomeMsg = welcomeMsg.replace('%user%', `${member.user}`);
			await welcomeChannel.send(welcomeMsg);
		}
	}

};
