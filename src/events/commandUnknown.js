const { Event, Stopwatch } = require('klasa');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'commandUnknown' });
	}

	async run(msg, command) {
		// Initialize runtime
		const runTime = new Stopwatch();

		// Return if custom commands aren't enabled or there are no custom commands on the server
		if (!msg.guild || !msg.guild.settings.commands.customCommandsEnabled) return;
		if (!msg.guild.settings.commands.customCommands.length) return;
		await msg.guild.settings.sync(true);

		// Checks unknown command against guild's custom commands
		command = command.toLowerCase();
		const customCommand = msg.guildSettings.commands.customCommands.find(c => c.name.toLowerCase() === command);
		// Return if custom command doesn't exist
		if (!customCommand) return;

		// Send custom command response
		await msg.channel.send(customCommand.content);

		// Set variables for devCommandLog
		const response = customCommand.content;
		const custom = true;

		// Fetch devCommandLog and stop runtime
		const devCommandLog = this.client.finalizers.get('devCommandLog');
		runTime.stop();

		// Call devCommandLog
		devCommandLog.run(msg, command, response, runTime, custom);
		return;
	}

};
