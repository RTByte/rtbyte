const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			permissionLevel: 6,
			description: language => language.get('COMMAND_AUTORESPONDER_DESCRIPTION'),
			extendedHelp: language => language.get('COMMAND_AUTORESPONDER_EXTENDEDHELP', this.client.options.prefix),
			runIn: ['text'],
			subcommands: true,
			quotedStringSupport: true,
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

		// Fetch autoresponder-related guild settings.
		const autoResponderEnabled = status[msg.guild.settings.get('autoResponder.autoResponderEnabled')];
		const autoResponses = msg.guild.settings.get('autoResponder.autoResponses').map(command => `• ${command.name}`).join('\n') || msg.language.get('NONE');

		// Build embed before sending.
		const embed = new MessageEmbed()
			.setAuthor(msg.language.get('COMMAND_AUTORESPONDER_SHOW_TITLE'), this.client.user.displayAvatarURL())
			.setColor(this.client.settings.get('colors.white'))
			.addField(msg.language.get('ENABLED'), autoResponderEnabled, true)
			.addField(msg.language.get('COMMAND_AUTORESPONDER_SHOW_RESPONSES'), autoResponses)
			.setThumbnail(msg.guild.iconURL(), 50, 50)
			.setTimestamp()
			.setFooter(msg.language.get('COMMAND_REQUESTED_BY', msg), msg.author.displayAvatarURL());

		return msg.send('', { disableEveryone: true, embed: embed });
	}

	async enable(msg) {
		// Fetch the autoresponder enabled boolean from the guild's settings.
		const autoResponderEnabled = msg.guild.settings.get('autoResponder.autoResponderEnabled');

		// If already enabled, stop process and inform the user.
		if (autoResponderEnabled) return msg.reject(msg.language.get('COMMAND_AUTORESPONDER_ENABLE_ALREADYENABLED'));

		// Set boolean to true and react with the affirm emoji to the user's message.
		await msg.guild.settings.update('autoResponder.autoResponderEnabled', true);
		return msg.affirm(msg.language.get('COMMAND_AUTORESPONDER_ENABLE_SUCCESS'));
	}

	async disable(msg) {
		// Fetch the autoresponder enabled boolean from the guild's settings.
		const autoResponderEnabled = msg.guild.settings.get('autoResponder.autoResponderEnabled');

		// If already disabled, stop process and inform the user.
		if (!autoResponderEnabled) return msg.reject(msg.language.get('COMMAND_AUTORESPONDER_DISABLE_ALREADYDISABLED'));

		// Set boolean to false and react with the affirm emoji to the user's message.
		await msg.guild.settings.update('autoResponder.autoResponderEnabled', false);
		return msg.affirm(msg.language.get('COMMAND_AUTORESPONDER_DISABLE_SUCCESS'));
	}

	async create(msg, [name, content]) {
		// Fetch the autoresponses array from the guild's settings.
		const autoResponses = msg.guild.settings.get('autoResponder.autoResponses');

		// If a autoresponder phrase (or word) or autoresponder response haven't been provided, stop process and inform user.
		if (!name) return msg.reject(msg.language.get('COMMAND_AUTORESPONDER_CREATE_NONAME'));
		if (!content) return msg.reject(msg.language.get('COMMAND_AUTORESPONDER_CREATE_NOCONTENT'));

		// Update the provided autoresponder phrase or word to be all lowercase.
		name = name.toLowerCase();

		// If the provided autoresponder phrase or word is already used in another autoresponse, stop process and inform user.
		const rspns = autoResponses.find(response => response.name.toLowerCase() === name);
		if (rspns) return msg.reject(msg.language.get('COMMAND_AUTORESPONDER_CREATE_ALREADYEXISTS', name));

		// Update the guild's autoresponses array and add the new autoresponse.
		await msg.guild.settings.update('autoResponder.autoResponses', { name: name, content: content });

		// Emit autoresponse created event, which shows up in a guild's log channel if the option is enabled.
		this.client.emit('autoResponseCreate', msg, name, content);

		return msg.affirm();
	}

	async delete(msg, [name]) {
		// Fetch the autoresponses array from the guild's settings.
		const autoResponses = msg.guild.settings.get('autoResponder.autoResponses');

		// If a If a autoresponder phrase or word hasn't been provided, stop process and inform user.
		if (!name) return msg.reject(msg.language.get('COMMAND_AUTORESPONDER_DELETE_NONAME'));

		// Update the provided autoresponder phrase or word name to be all lowercase.
		name = name.toLowerCase();

		// If the provided autoresponder phrase or word can't be found in any existing autoresponses, stop process and inform user.
		const rspns = autoResponses.find(response => response.name.toLowerCase() === name);
		if (!rspns) return msg.reject(msg.language.get('COMMAND_AUTORESPONDER_DELETE_NOTEXIST', name));

		// Update the guild's autoresponses array and remove the specified autoresponse.
		await msg.guild.settings.update('autoResponder.autoResponses', rspns, { action: 'remove' });

		// Emit autoresponse deleted event, which shows up in a guild's log channel if the option is enabled.
		this.client.emit('autoResponseDelete', msg, name);

		return msg.affirm();
	}

	async update(msg, [name, content]) {
		// Fetch the autoresponses array from the guild's settings.
		const autoResponses = msg.guild.settings.get('autoResponder.autoResponses');

		// If a autoresponder phrase (or word) or autoresponder response haven't been provided, stop process and inform user.
		if (!name) return msg.reject(msg.language.get('COMMAND_AUTORESPONDER_UPDATE_NONAME'));
		if (!content) return msg.reject(msg.language.get('COMMAND_AUTORESPONDER_UPDATE_NOCONTENT'));

		// Update the provided autoresponder key phrase or word to be all lowercase.
		name = name.toLowerCase();

		// Find and fetch the specified autoresponse.
		const rspns = autoResponses.find(response => response.name.toLowerCase() === name);

		if (rspns) {
			// Remove old autoresponse, then re-add it with the updated autoresponse response.
			const remove = await msg.guild.settings.update('autoResponder.autoResponses', rspns, { action: 'remove' });
			const add = await msg.guild.settings.update('autoResponder.autoResponses', { name: rspns.name, content: content }, { action: 'add' });

			// If an error occurs during the removal or creation, stop process and inform user.
			if (add.errors.length || remove.errors.length) return msg.reject(msg.language.get('COMMAND_AUTORESPONDER_UPDATE_ERROR', name));

			// Emit autoresponse update event, which shows up in a guild's log channel if the option is enabled.
			this.client.emit('autoResponseUpdate', msg, name, content, rspns);

			return msg.affirm();
		} else {
			// If autoresponse was not found, stop process and inform user.
			return msg.reject(msg.language.get('COMMAND_AUTORESPONDER_NOTEXIST', name));
		}
	}

};
