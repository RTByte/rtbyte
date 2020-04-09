const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'customCmdDelete' });
	}

	async run(msg, cmdName) {
		if (!msg.guild) return;

		if (msg.guild.settings.get('channels.log') && msg.guild.settings.get('logs.events.customCmdDelete')) await this.customCmdDeleteLog(msg, cmdName);

		return;
	}

	async customCmdDeleteLog(msg, cmdName) {
		const embed = new MessageEmbed()
			.setAuthor(`${cmdName}`, msg.guild.iconURL())
			.setColor(this.client.settings.get('colors.red'))
			.setTimestamp()
			.setFooter(msg.guild.language.get('GUILD_LOG_CUSTOMCMDDELETE'));
		const logChannel = await this.client.channels.get(msg.guild.settings.get('channels.log'));
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

};
