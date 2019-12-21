const { Command, Timestamp } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['q'],
			runIn: ['text', 'dm'],
			description: language => language.get('COMMAND_QUOTE_DESCRIPTION'),
			usage: '<messageID:string> [origin:channelname]',
			usageDelim: ' '
		});
		this.timestamp = new Timestamp('YYYY-MM-DD');
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
			.setFooter(`${this.timestamp.displayUTC(qmsg.createdAt)} ${msg.guild ? msg.language.get('COMMAND_QUOTE_CHANNEL', qmsg) : msg.language.get('COMMAND_QUOTE_DMS')}`);

		if (qmsg.content) await embed.addField(msg.language.get('MESSAGE'), `${qmsg.content}`, true);
		if (!qmsg.content) await embed.setTitle(msg.language.get('MESSAGE'));
		if (qmsg.attachments.size > 0) {
			attachment = qmsg.attachments.map(atch => atch.url).join(' ');
			attachment = attachment
				.replace('//cdn.', '//media.')
				.replace('.com/', '.net/');
			await embed.setImage(attachment);
		}

		return msg.send('', { disableEveryone: true, embed: embed });
	}

};
