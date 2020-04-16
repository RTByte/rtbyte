const { Event } = require('klasa');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'guildMemberDismiss' });
	}

	async run(member) {
		if (!member.guild.settings.get('greetings.goodbyeMessage')) return;

		const goodbyeChannel = await this.client.channels.get(member.guild.settings.get('greetings.goodbyeChannel'));
		let goodbyeMsg = member.guild.settings.get('greetings.goodbyeMessage');

		if (member.guild.settings.get('greetings.goodbyeMessage')) {
			goodbyeMsg = goodbyeMsg.replace('%user%', `${member.user.tag}`);
			await goodbyeChannel.send(goodbyeMsg);
		}
	}

};
