const { Event } = require('klasa');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'messageReactionRemoveAll' });
	}

	async run(msg) {
		if (!msg.guild) return;
		if (msg.guild.settings.get('boards.starboard.starboardIgnoredChannels').includes(msg.channel.id)) return;

		const starboardChannel = await this.client.channels.get(msg.guild.settings.get('boards.starboard.starboardChannel'));
		if (!msg.guild.settings.get('boards.starboard.starboardEnabled')) return;

		const starred = msg.guild.settings.get('boards.starboard.starred').find(star => star.msgID === msg.id);

		if (starred) {
			const message = await starboardChannel.messages.fetch(starred.starID);

			await msg.guild.settings.update('boards.starboard.starred', starred, { action: 'remove' });

			await message.delete();
		}

		return;
	}

};
