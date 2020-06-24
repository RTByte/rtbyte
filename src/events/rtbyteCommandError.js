const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'commandError' });
	}

	async run(message, command, params, error) {
		if (this.client.settings.get('logs.commandError')) await this.commandErrorLog(message, command, params, error);
		return message.reject(message.language.get('COMMAND_ERROR'));
	}

	async commandErrorLog(message, command, params, error) {
		const globalLog = await this.client.channels.get(this.client.settings.get('channels.globalLog'));
		const embed = new MessageEmbed()
			.setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
			.setColor(this.client.settings.get('colors.red'))
			.addField(globalLog.guild.language.get('COMMAND'), message.content)
			.addField(globalLog.guild.language.get('GLOBAL_LOG_ERROR_EXECUTEDIN'), message.guild ? `\`${message.guild.name} (${message.guild.id})\`` : `\`${message.author.tag} (${message.author.id})\``)
			.addField(globalLog.guild.language.get('GLOBAL_LOG_ERROR_ORIGIN'), `\`\`\`${command.path}\`\`\``)
			.addField(globalLog.guild.language.get('GLOBAL_LOG_ERROR_ERRORSTACK'), `\`\`\`${error ? error.stack ? error.stack : error : 'Unknown error'}\`\`\``)
			.setTimestamp()
			.setFooter(globalLog.guild.language.get('GLOBAL_LOG_COMMANDERROR'));
		if (globalLog) await globalLog.send('', { disableEveryone: true, embed: embed });
		return;
	}

};
