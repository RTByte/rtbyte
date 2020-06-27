const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const moment = require('moment-timezone');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['q'],
			runIn: ['text', 'dm'],
			description: language => language.get('COMMAND_QUOTE_DESCRIPTION'),
			usage: '<messageID:string> [origin:channelname]',
			usageDelim: ' '
		});
		this.customizeResponse('messageID', message =>
			message.language.get('COMMAND_QUOTE_NOPARAM'));
	}

	async run(msg, [messageID, origin = msg.channel]) {
		const qmsg = await origin.messages.fetch(messageID).catch(err => err.message === 'Unknown Message' ? null : msg.reject(err));
		if (!qmsg) return msg.reject(msg.language.get('COMMAND_QUOTE_NO_MESSAGE_FOUND', messageID, origin));

		return await this.sendQuote(msg, qmsg);
	}

	async sendQuote(msg, qmsg) {
		const embed = new MessageEmbed()
			.setAuthor(qmsg.author.tag, qmsg.author.displayAvatarURL())
			.setColor(this.client.settings.colors.white)
			.setDescription(`[${msg.language.get('CLICK_TO_VIEW')}](${qmsg.url})`)
			// eslint-disable-next-line max-len
			.setFooter(`${moment.tz(qmsg.createdTimestamp, msg.guild ? msg.guild.settings.timezone : 'Etc/Greenwich').format('Do MMMM YYYY, h:mmA zz')} ${msg.guild ? msg.language.get('COMMAND_QUOTE_CHANNEL', qmsg) : msg.language.get('COMMAND_QUOTE_DMS')}`);

		if (qmsg.content) await embed.addField(msg.guild.language.get('MESSAGE'), qmsg.content);
		if (qmsg.embeds.length) await embed.addField('‎', msg.language.get('MESSAGE_EMBED', qmsg.url));

		// Message attachment checks.
		let attachment, hasVideo = false;
		if (qmsg.attachments) {
			const atchs = qmsg.attachments.map(atch => atch.proxyURL);
			const atchSize = qmsg.attachments.map(atch => atch.size)[0] < 8388119;
			if (atchs.filter(pURL => pURL.endsWith('.mp4')).length || atchs.filter(pURL => pURL.endsWith('.webm')).length || atchs.filter(pURL => pURL.endsWith('.mov')).length) {
				if (atchSize) {
					hasVideo = true;
					[attachment] = [atchs[0]];
				} else {
					await embed.addField('‎', msg.language.get('MESSAGE_ATCH_TOOBIG', qmsg.url));
				}
			} else if (qmsg.attachments.size > 1) {
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
