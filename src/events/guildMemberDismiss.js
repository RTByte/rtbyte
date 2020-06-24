const { Event } = require('klasa');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'guildMemberDismiss' });
	}

	async run(member) {
		if (!member.guild.settings.get('greetings.dismissMessage')) return;

		const dismissChannel = await this.client.channels.get(member.guild.settings.get('greetings.dismissChannel'));
		let goodbyeMsg = member.guild.settings.get('greetings.dismissMessage');

		if (member.guild.settings.get('greetings.dismissMessage')) {
			goodbyeMsg = goodbyeMsg.replace('%user%', `${member.user.tag}`);
			if (dismissChannel) await dismissChannel.send(goodbyeMsg);
		}
	}

};
