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
		let attachment;
		const embed = new MessageEmbed()
			.setAuthor(qmsg.author.tag, qmsg.author.displayAvatarURL())
			.setColor(this.client.settings.colors.white)
			.setDescription(`[${msg.language.get('CLICK_TO_VIEW')}](${qmsg.url})`)
			// eslint-disable-next-line max-len
			.setFooter(`${moment.tz(qmsg.createdTimestamp, msg.guild ? msg.guild.settings.timezone : 'Etc/Greenwich').format('Do MMMM YYYY, h:mmA zz')} ${msg.guild ? msg.language.get('COMMAND_QUOTE_CHANNEL', qmsg) : msg.language.get('COMMAND_QUOTE_DMS')}`);

		if (qmsg.content) await embed.addField(msg.language.get('MESSAGE'), `${qmsg.content}`, true);
		if (!qmsg.content) await embed.setTitle(msg.language.get('MESSAGE'));
		if (qmsg.attachments.size > 0) {
			attachment = qmsg.attachments.cache.map(atch => atch.url).join(' ');
			attachment = attachment
				.replace('//cdn.', '//media.')
				.replace('.com/', '.net/');
			await embed.setImage(attachment);
		}

		return msg.send('', { disableEveryone: true, embed: embed });
	}

};
