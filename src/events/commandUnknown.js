const { Event, Stopwatch } = require('klasa');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'commandUnknown' });
	}

	async run(msg, command) {
		const runTime = new Stopwatch();
		if (!msg.guild || !msg.guild.settings.commands.customCommandsEnabled) return;
		if (!msg.guild.settings.commands.customCommands.length) return;
		await msg.guild.settings.sync(true);
		command = command.toLowerCase();
		const customCommand = msg.guildSettings.commands.customCommands.find(c => c.name.toLowerCase() === command);
		if (!customCommand) return;

		await msg.channel.send(customCommand.content);
		const response = customCommand.content;
		const custom = true;

		const devCommandLog = this.client.finalizers.get('devCommandLog');
		runTime.stop();
		devCommandLog.run(msg, command, response, runTime, custom);
		return;
	}

};
