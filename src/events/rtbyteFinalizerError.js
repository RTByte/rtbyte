const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');
const Sentry = require('@sentry/node');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'finalizerError' });
	}

	async run(message, command, response, timer, finalizer, error) {
		Sentry.withScope(scope => {
			scope.setTag('error-type', 'finalizer');
			scope.setContext('Message', message);

			Sentry.captureException(error);
		});

		if (this.client.settings.get('logs.finalizerError')) await this.finalizerErrorLog(message, command, response, timer, finalizer, error);
	}

	async finalizerErrorLog(message, command, response, timer, finalizer, error) {
		const globalLog = await this.client.channels.cache.get(this.client.settings.get('channels.globalLog'));

		const embed = new MessageEmbed()
			.setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
			.setColor(this.client.settings.get('colors.red'))
			.addField(globalLog.guild.language.get('COMMAND'), message.content)
			.addField(globalLog.guild.language.get('GLOBAL_LOG_ERROR_EXECUTEDIN'), message.guild ? `\`${message.guild.name} (${message.guild.id})\`` : `\`${message.author.tag} (${message.author.id})\``)
			.addField(globalLog.guild.language.get('GLOBAL_LOG_ERROR_ORIGIN'), `\`\`\`${finalizer.path}\`\`\``)
			.addField(globalLog.guild.language.get('GLOBAL_LOG_ERROR_ERRORSTACK'), `\`\`\`${error ? error.stack ? error.stack : error : 'Unknown error'}\`\`\``)
			.setTimestamp()
			.setFooter(globalLog.guild.language.get('GLOBAL_LOG_FINALIZERERROR'));

		if (globalLog) await globalLog.send('', { disableEveryone: true, embed: embed });

		return;
	}

};
