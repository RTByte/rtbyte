const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'customCmdUpdate' });
	}

	async run(msg, cmdName, cmdContent, oldCmd, executor) {
		if (!msg.guild) return;

		if (msg.guild.settings.channels.log && msg.guild.settings.logs.events.customCmdUpdate) await this.serverLog(msg, cmdName, cmdContent, oldCmd, executor);

		return;
	}

	async serverLog(msg, cmdName, cmdContent, oldCmd, executor) {
		const embed = new MessageEmbed()
			.setAuthor(`${cmdName}`, msg.guild.iconURL())
			.setColor(this.client.settings.colors.blue)
			.addField(msg.language.get('GUILD_LOG_BEFORE'), oldCmd.content)
			.addField(msg.language.get('GUILD_LOG_AFTER'), cmdContent)
			.setTimestamp()
			.setFooter(msg.guild.language.get('GUILD_LOG_CUSTOMCMDUPDATE', executor), executor.displayAvatarURL());
		const logChannel = await this.client.channels.get(msg.guild.settings.channels.log);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

};
