const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'messageReactionRemoveAll' });
	}

	async run(msg) {
		const starboardChannel = await this.client.channels.get(msg.guild.settings.get('boards.starboard.starboardChannel'));
		if (!msg.guild.settings.get('boards.starboard.starboardEnabled')) return;

		const starred = msg.guild.settings.get('boards.starboard.starred').find(star => star.msgID === msg.id);

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
