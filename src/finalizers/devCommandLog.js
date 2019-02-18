const { Finalizer } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Finalizer {

	constructor(...args) {
		super(...args, { enabled: true });
	}

	async run(message, command, response, runTime) {
		if (this.client.settings.logs.commandRun) await this.commandRunLog(message, runTime);

		return;
	}

	async commandRunLog(message, runTime) {
		const embed = new MessageEmbed()
			.setAuthor(`${message.author.tag} (${message.channel.guild.name})`, message.channel.guild.iconURL())
			.setDescription(`<#${message.channel.id}>`)
			.setColor(this.client.settings.colors.white)
			.setTimestamp()
			.addField('Message', message.content, true)
			.addField('Runtime', runTime, true)
			.setFooter(message.guild.language.get('GLOBAL_LOG_COMMANDRUN', message.channel));

		const globalLogChannel = await this.client.channels.get(this.client.settings.channels.globalLog);
		await globalLogChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

};
