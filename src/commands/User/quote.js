const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['q'],
			permissionLevel: 0,
			requiredPermissions: ['ADD_REACTIONS', 'USE_EXTERNAL_EMOJIS', 'SEND_MESSAGES', 'EMBED_LINKS'],
			runIn: ['text'],
			description: (msg) => msg.language.get('COMMAND_QUOTE_DESCRIPTION'),
			usage: '<messageID:string> [origin:channel]',
			usageDelim: ' '
		});
	}

	async run(msg, [messageID, origin = msg.channel]) {
		const qmsg = await origin.messages.fetch(messageID).catch(err => err.message === 'Unknown Message' ? null : msg.reject(err));
		if (!qmsg) return msg.reject(msg.guild.language.get('COMMAND_QUOTE_NO_MESSAGE_FOUND', messageID, origin));

		await msg.affirm();
		return await this.sendQuote(msg, qmsg);
	}

	async sendQuote(msg, qmsg) {
		const embed = new MessageEmbed()
			.setAuthor(qmsg.author.tag, qmsg.author.avatarURL())
			.setColor('#ffffff')
			.addField('Message:', `${qmsg.content}`, true)
			.setFooter(`Originally Sent on ${qmsg.createdAt} in #${qmsg.channel.name} on the ${qmsg.guild.name} Discord`);

		return msg.send('', { disableEveryone: true, embed: embed });
	}

};
