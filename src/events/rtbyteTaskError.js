const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');
const Sentry = require('@sentry/node');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'taskError' });
	}

	async run(scheduledTask, task, error) {
		Sentry.withScope(scope => {
			scope.setTag('error-type', 'task');
			scope.setLevel(this.client.options.production ? 'error' : 'debug');
			scope.setContext(scheduledTask);

			Sentry.captureException(error);
		});

		if (this.client.settings.get('logs.taskError')) await this.eventErrorLog(scheduledTask, task, error);
	}

	async eventErrorLog(scheduledTask, task, error) {
		const globalLog = await this.client.channels.cache.get(this.client.settings.get('channels.globalLog'));

		const embed = new MessageEmbed()
			.setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
			.setColor(this.client.settings.get('colors.red'))
			.addField(globalLog.guild.language.get('GLOBAL_LOG_ERROR_ORIGIN'), `\`\`\`${task.path}\`\`\``)
			.addField(globalLog.guild.language.get('GLOBAL_LOG_ERROR_ERRORSTACK'), `\`\`\`${error ? error.stack ? error.stack : error : 'Unknown error'}\`\`\``)
			.setTimestamp()
			.setFooter(globalLog.guild.language.get('GLOBAL_LOG_TASKERROR'));

		if (globalLog) await globalLog.send('', { disableEveryone: true, embed: embed });

		return;
	}

};
