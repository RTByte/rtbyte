/* eslint-disable complexity */
const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'messageReactionAdd' });
	}

	async run(reaction) {
		const msg = reaction.message;
		if (!msg.guild) return;
		if (msg.guild.settings.get('boards.starboard.starboardIgnoredChannels').includes(msg.channel.id)) return;

		const starboardChannel = await this.client.channels.cache.get(msg.guild.settings.get('boards.starboard.starboardChannel'));

		if (reaction.emoji.name !== '🌟' || msg.author.bot || msg.channel === starboardChannel) return;
		if (!msg.guild.settings.get('boards.starboard.starboardEnabled') || !starboardChannel) return;
		if (reaction.count < msg.guild.settings.get('boards.starboard.starboardThreshold')) return;

		const embed = new MessageEmbed()
			.setAuthor(msg.language.get('STARBOARD_STARRED'), msg.guild.iconURL())
			.setColor(this.client.settings.get('colors.gold'))
			.setDescription(`[${msg.language.get('CLICK_TO_VIEW')}](${msg.url})`)
			.addField(msg.language.get('BOARD_AUTHOR'), msg.author, true)
			.addField(msg.language.get('CHANNEL'), msg.channel, true)
			.setThumbnail(msg.author.displayAvatarURL())
			.setTimestamp(msg.createdTimestamp)
			.setFooter(`🌟 ${reaction.count}`);

		if (msg.content) await embed.addField(msg.guild.language.get('MESSAGE'), msg.content);
		if (msg.embeds.length) await embed.addField('‎', msg.language.get('MESSAGE_EMBED', msg.url));

		// Message attachment checks.
		let attachment, hasVideo = false;
		if (msg.attachments) {
			const atchs = msg.attachments.map(atch => atch.proxyURL);
			const atchSize = msg.attachments.map(atch => atch.size)[0] < 8388119;
			if (atchs.filter(pURL => pURL.endsWith('.mp4')).length || atchs.filter(pURL => pURL.endsWith('.webm')).length || atchs.filter(pURL => pURL.endsWith('.mov')).length) {
				if (atchSize) {
					hasVideo = true;
					[attachment] = [atchs[0]];
				} else {
					await embed.addField('‎', msg.language.get('MESSAGE_ATCH_TOOBIG', msg.url));
				}
			} else if (msg.attachments.size > 1) {
				[attachment] = [atchs[0]];
				await embed.addField('‎', msg.language.get('MESSAGE_MULTIPLE_ATCH'));
				await embed.setImage(attachment);
			} else {
				[attachment] = [atchs[0]];
				await embed.setImage(attachment);
			}
		}

		let starboardMsgID;
		const starred = msg.guild.settings.get('boards.starboard.starred').find(star => star.msgID === msg.id);

		if (!starred) {
			const message = await starboardChannel.send('', hasVideo ? { disableEveryone: true, embed: embed, files: [attachment] } : { disableEveryone: true, embed: embed });

			starboardMsgID = message.id;

			await msg.guild.settings.update('boards.starboard.starred', { msgID: msg.id, msgAuthor: msg.author.id, channelID: msg.channel.id, stars: reaction.count, starID: starboardMsgID });
		}

		if (starred) {
			const oldStarred = starred;
			if (oldStarred.stars < reaction.count) {
				const message = await starboardChannel.messages.fetch(starred.starID);

				starboardMsgID = message.id;

				await msg.guild.settings.update('boards.starboard.starred', starred, { action: 'remove' });
				await msg.guild.settings.update('boards.starboard.starred', { msgID: msg.id, msgAuthor: msg.author.id, channelID: msg.channel.id, stars: reaction.count, starID: starboardMsgID });

				await message.edit({ embed });
			}
		}

		return;
	}

};
