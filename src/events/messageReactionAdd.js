const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'messageReactionAdd' });
	}

	async run(reaction) {
		const msg = reaction.message;
		const starboardChannel = await this.client.channels.get(msg.guild.settings.boards.starboard.starboardChannel);

		if (reaction.emoji.name !== '🌟') return;
		if (msg.author.bot) return;
		if (!msg.guild.settings.boards.starboard.starboardEnabled) return;
		if (reaction.count < msg.guild.settings.boards.starboard.starboardThreshold) return;

		const embed = new MessageEmbed()
			.setAuthor(msg.language.get('STARBOARD_STARRED'), msg.guild.iconURL())
			.setColor(this.client.settings.colors.gold)
			.addField(msg.language.get('STARBOARD_AUTHOR'), msg.author, true)
			.addField(msg.language.get('STARBOARD_CHANNEL'), msg.channel, true)
			.addField(msg.language.get('MESSAGE'), msg.content)
			.setThumbnail(msg.author.displayAvatarURL())
			.setTimestamp(msg.createdTimestamp)
			.setFooter(`${msg.guild.settings.boards.starboard.starboardEmoji || '🌟'} ${reaction.count}`);

		let starboardMsgID;
		const starred = msg.guild.settings.boards.starboard.starred.find(star => star.msgID === msg.id);

		if (!starred) {
			await starboardChannel.send('', { disableEveryone: true, embed: embed })
				.then(message => {
					starboardMsgID = message.id;
					msg.guild.settings.update('boards.starboard.starred', { msgID: msg.id, content: msg.content, stars: reaction.count, starID: starboardMsgID });
				});
		}

		if (starred) {
			const oldStarred = starred;
			if (oldStarred.stars < reaction.count) {
				await starboardChannel.messages.fetch(starred.starID)
					.then(message => {
						starboardMsgID = message.id;
						msg.guild.settings.update('boards.starboard.starred', starred, { action: 'remove' });
						msg.guild.settings.update('boards.starboard.starred', { msgID: msg.id, content: msg.content, stars: reaction.count, starID: starboardMsgID }, { action: 'add' });

						message.edit({ embed });
					});
			}
		}

		return;
	}

};
