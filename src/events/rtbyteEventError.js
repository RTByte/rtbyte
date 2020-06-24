const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');
const errorEvents = ['rtbyteCommandError', 'rtbyteEventError', 'rtbyteFinalizerError', 'rtbyteMonitorError', 'rtbyteTaskError'];

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'eventError' });
	}

	async run(event, args, error) {
		const guild = args[0].guild ? args[0].guild : args[0].message ? args[0].message.guild : args[0];
		if (this.client.settings.get('logs.eventError') && !errorEvents.includes(event.name)) await this.eventErrorLog(event, args, error, guild);
	}

	async eventErrorLog(event, args, error, guild) {
		const globalLog = await this.client.channels.get(this.client.settings.get('channels.globalLog'));
		const embed = new MessageEmbed()
			.setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
			.setColor(this.client.settings.get('colors.red'))
			.addField(globalLog.guild.language.get('GLOBAL_LOG_ERROR_EXECUTEDIN'), `\`${guild.name} (${guild.id})\``)
			.addField(globalLog.guild.language.get('GLOBAL_LOG_ERROR_ORIGIN'), `\`\`\`${event.path}\`\`\``)
			.addField(globalLog.guild.language.get('GLOBAL_LOG_ERROR_ERRORSTACK'), `\`\`\`${error ? error.stack ? error.stack : error : 'Unknown error'}\`\`\``)
			.setTimestamp()
			.setFooter(globalLog.guild.language.get('GLOBAL_LOG_EVENTERROR'));
		if (globalLog) await globalLog.send('', { disableEveryone: true, embed: embed });

		return;
	}

};
