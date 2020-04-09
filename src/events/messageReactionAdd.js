const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'messageReactionAdd' });
	}

	async run(reaction) {
		if (!msg.guild) return;

		let attachment;
		const msg = reaction.message;
		const starboardChannel = await this.client.channels.get(msg.guild.settings.get('boards.starboard.starboardChannel'));

		if (reaction.emoji.name !== '🌟' || msg.author.bot || msg.channel === starboardChannel) return;
		if (!msg.guild.settings.get('boards.starboard.starboardEnabled')) return;
		if (reaction.count < msg.guild.settings.get('boards.starboard.starboardThreshold')) return;

		const embed = new MessageEmbed()
			.setAuthor(msg.language.get('STARBOARD_STARRED'), msg.guild.iconURL())
			.setColor(this.client.settings.get('colors.gold'))
			.setDescription(`[${msg.guild.language.get('CLICK_TO_VIEW')}](${msg.url})`)
			.addField(msg.language.get('STARBOARD_AUTHOR'), msg.author, true)
			.addField(msg.language.get('CHANNEL'), msg.channel, true)
			.setThumbnail(msg.author.displayAvatarURL())
			.setTimestamp(msg.createdTimestamp)
			.setFooter(`🌟 ${reaction.count}`);

		if (msg.content) await embed.addField(msg.guild.language.get('MESSAGE'), msg.content);
		if (msg.attachments.size > 0) {
			attachment = msg.attachments.map(atch => atch.url).join(' ');
			attachment = attachment
				.replace('//cdn.', '//media.')
				.replace('.com/', '.net/');
			await embed.setImage(attachment);
		}

		let starboardMsgID;
		const starred = msg.guild.settings.get('boards.starboard.starred').find(star => star.msgID === msg.id);

		if (!starred) {
			await starboardChannel.send('', { disableEveryone: true, embed: embed })
				.then(message => {
					starboardMsgID = message.id;
					msg.guild.settings.update('boards.starboard.starred', { msgID: msg.id, channelID: msg.channel.id, stars: reaction.count, starID: starboardMsgID });
				});
		}

		if (starred) {
			const oldStarred = starred;
			if (oldStarred.stars < reaction.count) {
				await starboardChannel.messages.fetch(starred.starID)
					.then(message => {
						starboardMsgID = message.id;
						msg.guild.settings.update('boards.starboard.starred', starred, { action: 'remove' });
						msg.guild.settings.update('boards.starboard.starred', { msgID: msg.id, channelID: msg.channel.id, stars: reaction.count, starID: starboardMsgID }, { action: 'add' });

						message.edit({ embed });
					});
			}
		}

		return;
	}

};
