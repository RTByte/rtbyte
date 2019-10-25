const { Finalizer } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Finalizer {

	constructor(...args) {
		super(...args, { enabled: true });
	}

	async run(message, command, response, runTime, custom) {
		// Checks if message sent in guild, command log enabled, guild opted in to command analytics, NOT custom, then calls commandRunLog
		// eslint-disable-next-line max-len
		if (message.guild && this.client.settings.logs.commandRun && message.guild.settings.developmentSettings.commandAnalytics && !custom) await this.commandRunLog(message, runTime, this.client.settings.channels.globalLog);
		// Checks if message NOT sent in guild, command log enabled, then calls dmCommandLog
		if (!message.guild && this.client.settings.logs.commandRun) await this.dmCommandLog(message, runTime, this.client.settings.channels.globalLog);
		// Checks if message sent in guild, guild command log enabled, then calls commandRunLog for guild
		if (message.guild && message.guild.settings.logs.events.commandRun) await this.commandRunLog(message, runTime, message.guild.settings.channels.log);

		return;
	}

	async commandRunLog(message, runTime, logChannel) {
		const embed = new MessageEmbed()
			.setAuthor(`${message.guild.name} (#${message.channel.name})`, message.guild.iconURL())
			.setColor(this.client.settings.colors.white)
			.setTitle(message.guild.language.get('GLOBAL_LOG_COMMANDRUN'))
			.setDescription(`[${message.guild.language.get('CLICK_TO_VIEW')}](${message.url})`)
			.addField('Message', message.content)
			.addField('Runtime', runTime)
			.setTimestamp()
			.setFooter(message.author.tag, message.author.displayAvatarURL());

		logChannel = await this.client.channels.get(logChannel);
		return logChannel.send('', { disableEveryone: true, embed: embed });
	}

	async dmCommandLog(message, runTime, logChannel) {
		const embed = new MessageEmbed()
			.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL())
			.setColor(this.client.settings.colors.white)
			.setTitle(message.language.get('GLOBAL_LOG_COMMANDRUN_DM'))
			.addField('Message', message.content)
			.addField('Runtime', runTime)
			.setTimestamp()
			.setFooter(message.author.tag, message.author.displayAvatarURL());

		logChannel = await this.client.channels.get(logChannel);
		return logChannel.send('', { disableEveryone: true, embed: embed });
	}

};
