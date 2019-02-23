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
			.setAuthor(`#${message.channel.name} | ${message.guild.name}`, message.guild.iconURL())
			.setColor(this.client.settings.colors.white)
			.setTitle(message.guild.language.get('GLOBAL_LOG_COMMANDRUN'))
			.addField('Message', message.content, true)
			.addField('Runtime', runTime, true)
			.setURL(message.url)
			.setTimestamp()
			.setFooter(message.author.tag, message.author.displayAvatarURL());

		const globalLogChannel = await this.client.channels.get(this.client.settings.channels.globalLog);
		await globalLogChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

};
