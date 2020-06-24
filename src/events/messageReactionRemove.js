const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'messageReactionRemove' });
	}

	async run(reaction) {
		const msg = reaction.message;
		if (!msg.guild) return;
		if (msg.guild.settings.get('boards.starboard.starboardIgnoredChannels').includes(msg.channel.id)) return;

		let attachment;
		const starboardChannel = await this.client.channels.get(msg.guild.settings.get('boards.starboard.starboardChannel'));

		if (reaction.emoji.name !== '🌟') return;
		if (msg.author.bot) return;
		if (!msg.guild.settings.get('boards.starboard.starboardEnabled') || !starboardChannel) return;

		const embed = new MessageEmbed()
			.setAuthor(msg.language.get('STARBOARD_STARRED'), msg.guild.iconURL())
			.setColor(this.client.settings.get('colors.gold'))
			.setDescription(`[${msg.guild.language.get('CLICK_TO_VIEW')}](${msg.url})`)
			.addField(msg.language.get('BOARD_AUTHOR'), msg.author, true)
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

		if (starred) {
			const oldStarred = starred;
			if (reaction.count < msg.guild.settings.get('boards.starboard.starboardThreshold') || reaction.count === 0) {
				const message = await starboardChannel.messages.fetch(starred.starID);

				await msg.guild.settings.update('boards.starboard.starred', starred, { action: 'remove' });

				await message.delete();
			}

			if (oldStarred.stars > reaction.count) {
				const message = await starboardChannel.messages.fetch(starred.starID);

				starboardMsgID = message.id;

				await msg.guild.settings.update('boards.starboard.starred', starred, { action: 'remove' });
				if (!(reaction.count < msg.guild.settings.get('boards.starboard.starboardThreshold'))) {
					await msg.guild.settings.update('boards.starboard.starred', { msgID: msg.id, msgAuthor: msg.author.id, channelID: msg.channel.id, stars: reaction.count, starID: starboardMsgID });

					await message.edit({ embed });
				}
			}
		}

		return;
	}

};
