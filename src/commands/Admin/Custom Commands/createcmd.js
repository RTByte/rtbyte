const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			aliases: ['addcmd', 'newcmd', 'createcommand', 'addcommand'],
			permissionLevel: 6,
			requiredSettings: ['commands.customCommandsEnabled'],
			description: language => language.get('COMMAND_CREATECMD_DESCRIPTION'),
			usage: '<name:string> <content:...string>',
			usageDelim: ' '
		});
		this.customizeResponse('name', msg =>
			msg.language.get('COMMAND_CREATECMD_NOPARAM_NAME'));
		this.customizeResponse('content', msg =>
			msg.language.get('COMMAND_CREATECMD_NOPARAM_CONTENT'));
	}

	async run(msg, [name, ...content]) {
		if (!msg.guild.settings.commands.customCommandsEnabled) return msg.reject(msg.language.get('COMMAND_CREATECMD_NOTENABLED'));

		name = name.toLowerCase();
		if (this.client.commands.has(name)) return msg.reject(msg.language.get('COMMAND_CUSTOM_CMD_NATIVE', name));
		// eslint-disable-next-line id-length
		const cmd = msg.guild.settings.commands.customCommands.find(c => c.name.toLowerCase() === name);
		if (cmd) return msg.reject(msg.language.get('COMMAND_CREATECMD_ALREADY_EXIST', name));
		await msg.guild.settings.update('commands.customCommands', { name: name, content: content.join(' ') });
		this.client.emit('customCmdCreate', msg, name, content, msg.author);
		return msg.affirm();
	}

};
