const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'messageDelete'	});
	}

	async run(msg) {
		if (!msg.guild) return;

		if (msg.guild.settings.get('channels.log') && msg.guild.settings.get('logs.events.messageDelete')) await this.serverLog(msg);

		return;
	}

	async serverLog(msg) {
		let attachment;

		const embed = new MessageEmbed()
			.setAuthor(msg.author.tag, msg.author.displayAvatarURL())
			.setDescription(msg.channel)
			.setColor(this.client.settings.get('colors.blue'))
			.setTimestamp()
			.setFooter(msg.language.get('GUILD_LOG_MESSAGEDELETE'));

		if (msg.content) await embed.addField(msg.guild.language.get('MESSAGE'), `${msg.content}`);
		if (!msg.content) await embed.setTitle(msg.guild.language.get('MESSAGE'));
		if (msg.attachments.size > 0) {
			attachment = msg.attachments.map(atch => atch.url).join(' ');
			attachment = attachment
				.replace('//cdn.', '//media.')
				.replace('.com/', '.net/');
			await embed.setImage(attachment);
		}

		const logChannel = await this.client.channels.get(msg.guild.settings.get('channels.log'));
		if (logChannel) await logChannel.send('', { disableEveryone: true, embed: embed });

		return;
	}

};
