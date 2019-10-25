const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			aliases: ['addcmd', 'newcmd', 'createcommand', 'addcommand'],
			permissionLevel: 6,
			description: language => language.get('COMMAND_CREATECMD_DESCRIPTION'),
			usage: '<name:string> <content:...string>',
			usageDelim: ' '
		});
	}

	async run(msg, [name, ...content]) {
		name = name.toLowerCase();
		if (this.client.commands.has(name)) return msg.reject();
		// eslint-disable-next-line id-length
		const cmd = msg.guild.settings.commands.customCommands.find(c => c.name.toLowerCase() === name);
		if (cmd) return msg.reject();
		await msg.guild.settings.update('commands.customCommands', { content: content.join(' '), name: name });
		return msg.affirm();
	}

};