const { Event, Stopwatch } = require('klasa');
const { MessageAttachment } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'commandUnknown' });
	}

	async run(msg, command) {
		if (!msg.guild) return;

		// Initialize runtime
		const runTime = new Stopwatch();

		// Return if custom commands aren't enabled or there are no custom commands on the server
		if (!msg.guild.settings.get('commands.customCommandsEnabled')) return;
		if (!msg.guild.settings.get('commands.customCommands').length) return;
		await msg.guild.settings.sync(true);

		// Checks unknown command against guild's custom commands
		command = command.toLowerCase();
		const customCommand = msg.guild.settings.get('commands.customCommands').find(custCmd => custCmd.name.toLowerCase() === command);
		// Return if custom command doesn't exist
		if (!customCommand) return;

		// Send custom command response
		let commandResponse = customCommand.content;
		const reg = new RegExp('.(jpg|png|gif)$');
		if (customCommand.content.match(reg)) commandResponse = new MessageAttachment(customCommand.content);
		await msg.channel.send(commandResponse);

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
