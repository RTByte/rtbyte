const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			permissionLevel: 6,
			description: language => language.get('COMMAND_CUSTOMCMDS_DESCRIPTION'),
			extendedHelp: language => language.get('COMMAND_CUSTOMCMDS_EXTENDEDHELP', this.client.options.prefix),
			runIn: ['text'],
			subcommands: true,
			usage: '<enable|disable|create|delete|update|show:default> [name:str] [content:...str]',
			usageDelim: ' '
		});
	}

	async show(msg) {
		const affirmEmoji = this.client.emojis.get(this.client.settings.get('emoji.affirm'));
		const rejectEmoji = this.client.emojis.get(this.client.settings.get('emoji.reject'));
		const status = {
			true: affirmEmoji,
			false: rejectEmoji
		};

		const customCommandsEnabled = status[msg.guild.settings.get('commands.customCommandsEnabled')];
		const customCommands = msg.guild.settings.get('commands.customCommands').map(command => `• ${command.name}`).join('\n') || msg.language.get('NONE');

		const embed = new MessageEmbed()
			.setAuthor(msg.language.get('COMMAND_CUSTOMCMDS_SHOW_TITLE'), this.client.user.displayAvatarURL())
			.setColor(this.client.settings.get('colors.white'))
			.addField(msg.language.get('ENABLED'), customCommandsEnabled, true)
			.addField(msg.language.get('CUSTOM_COMMANDS'), customCommands)
			.setThumbnail(msg.guild.iconURL(), 50, 50)
			.setTimestamp()
			.setFooter(msg.language.get('COMMAND_REQUESTED_BY', msg), msg.author.displayAvatarURL());

		return msg.send('', { disableEveryone: true, embed: embed });
	}

	async enable(msg) {
		const customCommandsEnabled = msg.guild.settings.get('commands.customCommandsEnabled');

		if (customCommandsEnabled) return msg.reject(msg.language.get('COMMAND_CUSTOMCMDS_ENABLE_ALREADYENABLED'));

		await msg.guild.settings.update('commands.customCommandsEnabled', true);
		return msg.affirm(msg.language.get('COMMAND_CUSTOMCMDS_ENABLE_SUCCESS'));
	}

	async disable(msg) {
		const customCommandsEnabled = msg.guild.settings.get('commands.customCommandsEnabled');

		if (!customCommandsEnabled) return msg.reject(msg.language.get('COMMAND_CUSTOMCMDS_DISABLE_ALREADYDISABLED'));

		await msg.guild.settings.update('commands.customCommandsEnabled', false);
		return msg.affirm(msg.language.get('COMMAND_CUSTOMCMDS_DISABLE_SUCCESS'));
	}

	async create(msg, [name, content]) {
		const customCommands = msg.guild.settings.get('commands.customCommands');

		if (!name) msg.reject(msg.language.get('COMMAND_CUSTOMCMDS_CREATE_NONAME'));
		if (!content) msg.reject(msg.language.get('COMMAND_CUSTOMCMDS_CREATE_NOCONTENT'));

		name = name.toLowerCase();
		if (this.client.commands.has(name)) return msg.reject(msg.language.get('COMMAND_CUSTOMCMDS_CREATE_NATIVE', name));
		const cmd = customCommands.find(command => command.name.toLowerCase() === name);
		if (cmd) return msg.reject(msg.language.get('COMMAND_CUSTOMCMDS_CREATE_ALREADYEXISTS', name));

		await msg.guild.settings.update('commands.customCommands', { name: name, content: content });
		this.client.emit('customCmdCreate', msg, name, content);

		return msg.affirm();
	}

	async delete(msg, [name]) {
		const customCommands = msg.guild.settings.get('commands.customCommands');

		if (!name) msg.reject(msg.language.get('COMMAND_CUSTOMCMDS_DELETE_NONAME'));

		name = name.toLowerCase();
		const cmd = customCommands.find(command => command.name.toLowerCase() === name);
		if (!cmd) return msg.reject(msg.language.get('COMMAND_CUSTOMCMDS_DELETE_NOTEXIST', name));

		await msg.guild.settings.update('commands.customCommands', cmd, { action: 'remove' });
		this.client.emit('customCmdDelete', msg, name);

		return msg.affirm();
	}

	async update(msg, [name, content]) {
		const customCommands = msg.guild.settings.get('commands.customCommands');

		if (!name) msg.reject(msg.language.get('COMMAND_CUSTOMCMDS_UPDATE_NONAME'));
		if (!content) msg.reject(msg.language.get('COMMAND_CUSTOMCMDS_UPDATE_NOCONTENT'));

		name = name.toLowerCase();
		if (this.client.commands.has(name)) return msg.reject(msg.language.get('COMMAND_CUSTOMCMDS_UPDATE_NATIVE'));
		const cmd = customCommands.find(command => command.name.toLowerCase() === name);

		if (cmd) {
			const oldCmd = cmd;
			const remove = await msg.guild.settings.update('commands.customCommands', cmd, { action: 'remove' });
			const add = await msg.guild.settings.update('commands.customCommands', { name: cmd.name, content: content }, { action: 'add' });
			if (add.errors.length || remove.errors.length) return msg.reject(msg.language.get('COMMAND_UPDATECMD_ERROR', name));
			this.client.emit('customCmdUpdate', msg, name, content, oldCmd);

			return msg.affirm();
		} else {
			return msg.reject(msg.language.get('COMMAND_CUSTOMCMDS_NOTEXIST', name));
		}
	}

};
