const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['pinned', 'pins'],
			description: language => language.get('COMMAND_PIN_DESCRIPTION'),
			runIn: ['text'],
			usage: '[member:membername]'
		});
	}

	async run(msg, [member]) {
		if (!msg.guild.settings.get('boards.pinboard.pinboardEnabled')) return msg.send(msg.language.get('COMMAND_PIN_PINBOARD_NOT_ENABLED'));

		const pinnedMessages = msg.guild.settings.get('boards.pinboard.pinned');
		if (!pinnedMessages) return msg.send(msg.language.get('COMMAND_PIN_NOPINNED'));

		let selected = pinnedMessages[Math.floor(Math.random() * pinnedMessages.length)];
		if (member) selected = pinnedMessages.filter(pinned => member.id === pinned.msgAuthor)[Math.floor(Math.random() * pinnedMessages.filter(pinned => member.id === pinned.msgAuthor).length)];
		if (member && pinnedMessages.filter(pinned => member.id === pinned.msgAuthor).length === 0) return msg.reject(msg.language.get('COMMAND_PIN_MEMBER_NOPINNED'));
		const { msgID, channelID, pinner } = selected;

		const channel = await msg.guild.channels.get(channelID);
		const fetchedPin = await channel.messages.fetch(msgID);
		const fetchedPinner = await this.client.users.get(pinner);

		const embed = new MessageEmbed()
			.setAuthor(msg.language.get('COMMAND_PIN_PINNED'), msg.guild.iconURL())
			.setColor(fetchedPin.member.highestRole ? fetchedPin.member.highestRole.color : this.client.settings.get('colors.white'))
			.setDescription(`[${msg.guild.language.get('CLICK_TO_VIEW')}](${fetchedPin.url})`)
			.addField(msg.language.get('BOARD_AUTHOR'), fetchedPin.author, true)
			.addField(msg.language.get('CHANNEL'), channel, true)
			.setThumbnail(fetchedPin.author.displayAvatarURL())
			.setTimestamp(fetchedPin.createdTimestamp)
			.setFooter(msg.language.get('PINBOARD_PINNED_BY', fetchedPinner), fetchedPinner ? fetchedPinner.displayAvatarURL() : undefined);

		if (fetchedPin.content) await embed.addField(msg.guild.language.get('MESSAGE'), fetchedPin.content);
		if (fetchedPin.embeds.length) await embed.addField('‎', msg.language.get('MESSAGE_EMBED', fetchedPin.url));

		// Message attachment checks.
		let attachment, hasVideo = false;
		if (fetchedPin.attachments) {
			const atchs = fetchedPin.attachments.map(atch => atch.proxyURL);
			const atchSize = fetchedPin.attachments.map(atch => atch.size)[0] < 8388119;
			if (atchs.filter(pURL => pURL.endsWith('.mp4')).length || atchs.filter(pURL => pURL.endsWith('.webm')).length || atchs.filter(pURL => pURL.endsWith('.mov')).length) {
				if (atchSize) {
					hasVideo = true;
					[attachment] = [atchs[0]];
				} else {
					await embed.addField('‎', msg.language.get('MESSAGE_ATCH_TOOBIG', fetchedPin.url));
				}
			} else if (fetchedPin.attachments.size > 1) {
				[attachment] = [atchs[0]];
				await embed.addField('‎', msg.language.get('MESSAGE_MULTIPLE_ATCH'));
				await embed.setImage(attachment);
			} else {
				[attachment] = [atchs[0]];
				await embed.setImage(attachment);
			}
		}

		return msg.send('', hasVideo ? { disableEveryone: true, embed: embed, files: [attachment] } : { disableEveryone: true, embed: embed });
	}

};
