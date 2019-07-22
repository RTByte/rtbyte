const { Command, Timestamp } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['q'],
			runIn: ['text'],
			description: language => language.get('COMMAND_QUOTE_DESCRIPTION'),
			usage: '<messageID:string> [origin:channel]',
			usageDelim: ' '
		});
		this.timestamp = new Timestamp('YYYY-MM-DD, h:mm A');
		this.customizeResponse('messageID', message =>
			message.language.get('COMMAND_QUOTE_NOPARAM'));
	}

	async run(msg, [messageID, origin = msg.channel]) {
		const qmsg = await origin.messages.fetch(messageID).catch(err => err.message === 'Unknown Message' ? null : msg.reject(err));
		if (!qmsg) return msg.reject(msg.guild.language.get('COMMAND_QUOTE_NO_MESSAGE_FOUND', messageID, origin));

		return await this.sendQuote(msg, qmsg);
	}

	async sendQuote(msg, qmsg) {
		let attachment;
		const embed = new MessageEmbed()
			.setAuthor(qmsg.author.tag, qmsg.author.displayAvatarURL())
			.setColor(this.client.settings.colors.white)
			.setFooter(`${this.timestamp.displayUTC(qmsg.createdAt)} ${msg.guild.language.get('COMMAND_QUOTE_CHANNEL', qmsg)}`);

		if (qmsg.content) await embed.addField(msg.guild.language.get('MESSAGE'), `${qmsg.content}`, true)
		if (!qmsg.content) await embed.setTitle(msg.guild.language.get('MESSAGE'));
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
