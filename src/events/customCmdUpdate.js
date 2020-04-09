const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'customCmdUpdate' });
	}

	async run(msg, cmdName, cmdContent, oldCmd) {
		if (!msg.guild) return;

		if (msg.guild.settings.get('channels.log') && msg.guild.settings.get('logs.events.customCmdUpdate')) await this.customCmdCreateLog(msg, cmdName, cmdContent, oldCmd);

		return;
	}

	async customCmdCreateLog(msg, cmdName, cmdContent, oldCmd) {
		const embed = new MessageEmbed()
			.setAuthor(`${cmdName}`, msg.guild.iconURL())
			.setColor(this.client.settings.get('colors.blue'))
			.addField(msg.language.get('GUILD_LOG_BEFORE'), oldCmd.content)
			.addField(msg.language.get('GUILD_LOG_AFTER'), cmdContent)
			.setTimestamp()
			.setFooter(msg.guild.language.get('GUILD_LOG_CUSTOMCMDUPDATE'));
		const logChannel = await this.client.channels.get(msg.guild.settings.get('channels.log'));
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

};
