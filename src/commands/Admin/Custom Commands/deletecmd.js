const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			aliases: ['removecmd', 'delcmd', 'deletecommand', 'removecommand'],
			permissionLevel: 6,
			requiredSettings: ['commands.customCommandsEnabled'],
			description: language => language.get('COMMAND_DELETECMD_DESCRIPTION'),
			usage: '<name:string>',
			usageDelim: ' '
		});
		this.customizeResponse('name', msg =>
			msg.language.get('COMMAND_DELETECMD_NOPARAM'));
	}

	async run(msg, [name]) {
		if (!msg.guild.settings.commands.customCommandsEnabled) return msg.reject(msg.language.get('COMMAND_DELETECMD_NOTENABLED'));

		name = name.toLowerCase();
		// eslint-disable-next-line id-length
		const cmd = msg.guild.settings.commands.customCommands.find(c => c.name.toLowerCase() === name);
		if (!cmd) return msg.reject(msg.language.get('COMMAND_CUSTOMCMD_NOT_EXIST'));
		await msg.guild.settings.update('commands.customCommands', cmd, { action: 'remove' });
		this.client.emit('customCmdDelete', msg, name, msg.author);
		return msg.affirm();
	}

};
