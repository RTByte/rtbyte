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
		// Fetch required emojis and assiociate true or false with the corresponding one.
		const affirmEmoji = this.client.emojis.cache.get(this.client.settings.get('emoji.affirm'));
		const rejectEmoji = this.client.emojis.cache.get(this.client.settings.get('emoji.reject'));
		const status = {
			true: affirmEmoji,
			false: rejectEmoji
		};

		// Fetch custom command-related guild settings.
		const customCommandsEnabled = status[msg.guild.settings.get('commands.customCommandsEnabled')];
		const customCommands = msg.guild.settings.get('commands.customCommands').map(command => `• ${command.name}`).join('\n') || msg.language.get('NONE');

		// Build embed before sending.
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
		// Fetch the custom commands enabled boolean from the guild's settings.
		const customCommandsEnabled = msg.guild.settings.get('commands.customCommandsEnabled');

		// If already enabled, stop process and inform the user.
		if (customCommandsEnabled) return msg.reject(msg.language.get('COMMAND_CUSTOMCMDS_ENABLE_ALREADYENABLED'));

		// Set boolean to true and react with the affirm emoji to the user's message.
		await msg.guild.settings.update('commands.customCommandsEnabled', true);
		return msg.affirm(msg.language.get('COMMAND_CUSTOMCMDS_ENABLE_SUCCESS'));
	}

	async disable(msg) {
		// Fetch the custom commands enabled boolean from the guild's settings.
		const customCommandsEnabled = msg.guild.settings.get('commands.customCommandsEnabled');

		// If already disabled, stop process and inform the user.
		if (!customCommandsEnabled) return msg.reject(msg.language.get('COMMAND_CUSTOMCMDS_DISABLE_ALREADYDISABLED'));

		// Set boolean to false and react with the affirm emoji to the user's message.
		await msg.guild.settings.update('commands.customCommandsEnabled', false);
		return msg.affirm(msg.language.get('COMMAND_CUSTOMCMDS_DISABLE_SUCCESS'));
	}

	async create(msg, [name, content]) {
		// Fetch the custom commands array from the guild's settings.
		const customCommands = msg.guild.settings.get('commands.customCommands');

		// If a command name or command response haven't been provided, stop process and inform user.
		if (!name) return msg.reject(msg.language.get('COMMAND_CUSTOMCMDS_CREATE_NONAME'));
		if (!content) return msg.reject(msg.language.get('COMMAND_CUSTOMCMDS_CREATE_NOCONTENT'));

		// Update the provided custom command name to be all lowercase.
		name = name.toLowerCase();

		// If the provided custom command name exists as a native command, stop process and inform user.
		if (this.client.commands.has(name)) return msg.reject(msg.language.get('COMMAND_CUSTOMCMDS_CREATE_NATIVE', name));

		// If the provided custom command name is already used in another custom command, stop process and inform user.
		const cmd = customCommands.find(command => command.name.toLowerCase() === name);
		if (cmd) return msg.reject(msg.language.get('COMMAND_CUSTOMCMDS_CREATE_ALREADYEXISTS', name));

		// Update the guild's custom commands array and add the new command.
		await msg.guild.settings.update('commands.customCommands', { name: name, content: content });

		// Emit custom command created event, which shows up in a guild's log channel if the option is enabled.
		this.client.emit('customCmdCreate', msg, name, content);

		return msg.affirm();
	}

	async delete(msg, [name]) {
		// Fetch the custom commands array from the guild's settings.
		const customCommands = msg.guild.settings.get('commands.customCommands');

		// If a command name hasn't been provided, stop process and inform user.
		if (!name) return msg.reject(msg.language.get('COMMAND_CUSTOMCMDS_DELETE_NONAME'));

		// Update the provided custom command name to be all lowercase.
		name = name.toLowerCase();

		// If the provided custom command name can't be found in any existing custom commands, stop process and inform user.
		const cmd = customCommands.find(command => command.name.toLowerCase() === name);
		if (!cmd) return msg.reject(msg.language.get('COMMAND_CUSTOMCMDS_DELETE_NOTEXIST', name));

		// Update the guild's custom commands array and remove the specified custom command.
		await msg.guild.settings.update('commands.customCommands', cmd, { action: 'remove' });

		// Emit custom command created event, which shows up in a guild's log channel if the option is enabled.
		this.client.emit('customCmdDelete', msg, name);

		return msg.affirm();
	}

	async update(msg, [name, content]) {
		// Fetch the custom commands array from the guild's settings.
		const customCommands = msg.guild.settings.get('commands.customCommands');

		// If a command name or command response haven't been provided, stop process and inform user.
		if (!name) return msg.reject(msg.language.get('COMMAND_CUSTOMCMDS_UPDATE_NONAME'));
		if (!content) return msg.reject(msg.language.get('COMMAND_CUSTOMCMDS_UPDATE_NOCONTENT'));

		// Update the provided custom command name to be all lowercase.
		name = name.toLowerCase();

		// If the provided custom command name exists as a native command, stop process and inform user.
		if (this.client.commands.has(name)) return msg.reject(msg.language.get('COMMAND_CUSTOMCMDS_UPDATE_NATIVE'));

		// Find and fetch the specified custom command.
		const cmd = customCommands.find(command => command.name.toLowerCase() === name);

		if (cmd) {
			// Remove old custom command, then re-add it with the updated command response.
			const remove = await msg.guild.settings.update('commands.customCommands', cmd, { action: 'remove' });
			const add = await msg.guild.settings.update('commands.customCommands', { name: cmd.name, content: content }, { action: 'add' });

			// If an error occurs during the removal or creation, stop process and inform user.
			if (add.errors.length || remove.errors.length) return msg.reject(msg.language.get('COMMAND_UPDATECMD_ERROR', name));

			// Emit custom command update event, which shows up in a guild's log channel if the option is enabled.
			this.client.emit('customCmdUpdate', msg, name, content, cmd);

			return msg.affirm();
		} else {
			// If custom command was not found, stop process and inform user.
			return msg.reject(msg.language.get('COMMAND_CUSTOMCMDS_NOTEXIST', name));
		}
	}

};
