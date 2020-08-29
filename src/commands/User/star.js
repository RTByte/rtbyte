const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['starred', 'stars'],
			description: language => language.get('COMMAND_STAR_DESCRIPTION'),
			runIn: ['text'],
			subcommands: true,
			usage: '<top|random:default> [member:membername]',
			usageDelim: ' '
		});
	}

	async random(msg, [member]) {
		if (!msg.guild.settings.get('boards.starboard.starboardEnabled')) return msg.send(msg.language.get('COMMAND_STAR_STARBOARD_NOT_ENABLED'));

		const starredMessages = msg.guild.settings.get('boards.starboard.starred');
		if (!starredMessages) return msg.send(msg.language.get('COMMAND_STAR_NOSTARRED'));

		let selected = starredMessages[Math.floor(Math.random() * starredMessages.length)];
		if (member) selected = starredMessages.filter(st => member.id === st.msgAuthor)[Math.floor(Math.random() * starredMessages.filter(st => member.id === st.msgAuthor).length)];
		if (member && starredMessages.filter(st => member.id === st.msgAuthor).length === 0) return msg.reject(msg.language.get('COMMAND_STAR_MEMBER_NOSTARRED'));
		const { msgID, channelID, stars } = selected;

		const channel = await msg.guild.channels.cache.get(channelID);
		const fetchedStar = await channel.messages.fetch(msgID);

		const embed = new MessageEmbed()
			.setAuthor(msg.language.get('COMMAND_STAR_STARRED'), msg.guild.iconURL())
			.setColor(this.client.settings.get('colors.gold'))
			.setDescription(`[${msg.guild.language.get('CLICK_TO_VIEW')}](${fetchedStar.url})`)
			.addField(msg.language.get('BOARD_AUTHOR'), fetchedStar.author, true)
			.addField(msg.language.get('CHANNEL'), fetchedStar.channel, true)
			.setThumbnail(fetchedStar.author.displayAvatarURL())
			.setTimestamp(fetchedStar.createdTimestamp)
			.setFooter(`🌟 ${stars}`);

		if (fetchedStar.content) await embed.addField(msg.guild.language.get('MESSAGE'), fetchedStar.content);
		if (fetchedStar.embeds.length) await embed.addField('‎', msg.language.get('MESSAGE_EMBED', fetchedStar.url));

		// Message attachment checks.
		let attachment;
		if (fetchedStar.attachments) {
			const atchs = fetchedStar.attachments.map(atch => atch.proxyURL);
			const atchSize = fetchedStar.attachments.map(atch => atch.size)[0] < 8388119;
			if (atchs.filter(pURL => pURL.endsWith('.mp4')).length || atchs.filter(pURL => pURL.endsWith('.webm')).length || atchs.filter(pURL => pURL.endsWith('.mov')).length) {
				if (atchSize) {
					await embed.attachFiles(atchs[0]);
				} else {
					await embed.addField('‎', msg.language.get('MESSAGE_ATCH_TOOBIG', fetchedStar.url));
				}
			} else if (fetchedStar.attachments.size > 1) {
				[attachment] = [atchs[0]];
				await embed.addField('‎', msg.language.get('MESSAGE_MULTIPLE_ATCH'));
				await embed.setImage(attachment);
			} else {
				[attachment] = [atchs[0]];
				await embed.setImage(attachment);
			}
		}

		return msg.send('', { embed: embed });
	}

	async top(msg, [member]) {
		if (!msg.guild.settings.get('boards.starboard.starboardEnabled')) return msg.send(msg.language.get('COMMAND_STAR_STARBOARD_NOT_ENABLED'));

		const starredMessages = msg.guild.settings.get('boards.starboard.starred');
		if (!starredMessages) return msg.send(msg.language.get('COMMAND_STAR_NOSTARRED'));

		const top = Math.max(...starredMessages.map(st => st.stars), 0);
		let selected = starredMessages.find(st => st.stars === top);
		if (member) {
			const memberTop = Math.max(...starredMessages.filter(st => member.id === st.msgAuthor).map(st => st.stars), 0);
			selected = starredMessages.filter(st => member.id === st.msgAuthor).find(st => st.stars === memberTop);
		}
		if (!selected) return msg.reject(msg.language.get('COMMAND_STAR_NOTOP', member));
		const { msgID, channelID, stars } = selected;

		const channel = await msg.guild.channels.cache.get(channelID);
		const fetchedStar = await channel.messages.fetch(msgID);

		const embed = new MessageEmbed()
			.setAuthor(msg.language.get('COMMAND_STAR_STARRED'), msg.guild.iconURL())
			.setColor(this.client.settings.get('colors.gold'))
			.setDescription(`[${msg.guild.language.get('CLICK_TO_VIEW')}](${fetchedStar.url})`)
			.addField(msg.language.get('BOARD_AUTHOR'), fetchedStar.author, true)
			.addField(msg.language.get('CHANNEL'), fetchedStar.channel, true)
			.setThumbnail(fetchedStar.author.displayAvatarURL())
			.setTimestamp(fetchedStar.createdTimestamp)
			.setFooter(`🌟 ${stars}`);

		if (fetchedStar.content) await embed.addField(msg.guild.language.get('MESSAGE'), fetchedStar.content);
		if (fetchedStar.embeds.length) await embed.addField('‎', msg.language.get('MESSAGE_EMBED', fetchedStar.url));

		// Message attachment checks.
		let attachment;
		if (fetchedStar.attachments) {
			const atchs = fetchedStar.attachments.map(atch => atch.proxyURL);
			const atchSize = fetchedStar.attachments.map(atch => atch.size)[0] < 8388119;
			if (atchs.filter(pURL => pURL.endsWith('.mp4')).length || atchs.filter(pURL => pURL.endsWith('.webm')).length || atchs.filter(pURL => pURL.endsWith('.mov')).length) {
				if (atchSize) {
					await embed.attachFiles(atchs[0]);
				} else {
					await embed.addField('‎', msg.language.get('MESSAGE_ATCH_TOOBIG', fetchedStar.url));
				}
			} else if (fetchedStar.attachments.size > 1) {
				[attachment] = [atchs[0]];
				await embed.addField('‎', msg.language.get('MESSAGE_MULTIPLE_ATCH'));
				await embed.setImage(attachment);
			} else {
				[attachment] = [atchs[0]];
				await embed.setImage(attachment);
			}
		}

		return msg.send('', { embed: embed });
	}

};
