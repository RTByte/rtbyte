const { Event } = require('klasa');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'messageReactionRemoveAll' });
	}

	async run(msg) {
		if (!msg.guild) return;

		const starboardChannel = await this.client.channels.cache.get(msg.guild.settings.boards.starboard.starboardChannel);
		if (!msg.guild.settings.boards.starboard.starboardEnabled) return;

		const starred = msg.guild.settings.boards.starboard.starred.find(star => star.msgID === msg.id);

		if (starred) {
			await starboardChannel.messages.fetch(starred.starID)
				.then(message => {
					msg.guild.settings.update('boards.starboard.starred', starred, { action: 'remove' });
					message.delete();
				});
		}

		return;
	}

};
