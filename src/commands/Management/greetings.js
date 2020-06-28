/* eslint-disable complexity */
const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			permissionLevel: 7,
			description: language => language.get('COMMAND_GREETINGS_DESCRIPTION'),
			runIn: ['text'],
			subcommands: true,
			usage: '<enable|disable|set|reset|show:default> [welcome|dismiss] [channel|message] [value:channel|value:...str]',
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

		// Fetch and resolve relevant guild settings.
		const welcomeNewUsers = status[msg.guild.settings.get('greetings.welcomeNewUsers')];
		const welcomeChannel = msg.guild.channels.cache.get(msg.guild.settings.get('greetings.welcomeChannel')) || msg.language.get('NOT_SET');
		const welcomeMessage = msg.guild.settings.get('greetings.welcomeMessage') ? msg.guild.settings.get('greetings.welcomeMessage').replace('%user%', '`@username`') : msg.language.get('NOT_SET');
		const dismissUsers = status[msg.guild.settings.get('greetings.dismissUsers')];
		const dismissChannel = msg.guild.channels.cache.get(msg.guild.settings.get('greetings.dismissChannel')) || msg.language.get('NOT_SET');
		const dismissMessage = msg.guild.settings.get('greetings.dismissMessage') ? msg.guild.settings.get('greetings.dismissMessage').replace('%user%', '`@username`') : msg.language.get('NOT_SET');

		// Build embed before sending.
		const embed = new MessageEmbed()
			.setAuthor(msg.language.get('COMMAND_GREETINGS_SHOW_TITLE'), this.client.user.displayAvatarURL())
			.setColor(this.client.settings.get('colors.white'))
			.addField(msg.language.get('COMMAND_GREETINGS_SHOW_WELCOME'), welcomeNewUsers, true)
			.addField(msg.language.get('COMMAND_GREETINGS_SHOW_WELCOME_CHANNEL'), welcomeChannel, true)
			.addField(msg.language.get('COMMAND_GREETINGS_SHOW_WELCOME_MESSAGE'), welcomeMessage)
			.addField(msg.language.get('COMMAND_GREETINGS_SHOW_DISMISS'), dismissUsers, true)
			.addField(msg.language.get('COMMAND_GREETINGS_SHOW_DISMISS_CHANNEL'), dismissChannel, true)
			.addField(msg.language.get('COMMAND_GREETINGS_SHOW_DISMISS_MESSAGE'), dismissMessage)
			.setThumbnail(msg.guild.iconURL(), 50, 50)
			.setTimestamp()
			.setFooter(msg.language.get('COMMAND_REQUESTED_BY', msg), msg.author.displayAvatarURL());

		return msg.send('', { disableEveryone: true, embed: embed });
	}

	async enable(msg, [setting]) {
		// If a setting hasn't been specified, stop process and inform user.
		if (!setting) return msg.reject(msg.language.get('COMMAND_GREETINGS_ENABLE_NOSETTING'));

		// Set specified setting to lowercase and check if what user entered matches what we expect.
		setting = setting.toLowerCase();
		if (!['welcome', 'dismiss'].includes(setting)) return msg.reject(msg.language.get('COMMAND_GREETINGS_ENABLE_ONLY_WELCOME_DISMISS'));

		// Fetch relevant guild settings.
		const welcomeNewUsers = msg.guild.settings.get('greetings.welcomeNewUsers');
		const dismissUsers = msg.guild.settings.get('greetings.dismissUsers');

		// Check if the specified setting matches what we expect, then change the setting variable to what the config option is called.
		if (setting === 'welcome') setting = 'welcomeNewUsers';
		if (setting === 'dismiss') setting = 'dismissUsers';

		// If specified boolean is already true, stop process and inform user.
		if (setting === 'welcomeNewUsers' && welcomeNewUsers) return msg.reject(msg.language.get('COMMAND_GREETINGS_ENABLE_ALREADYENABLED_WELCOME'));
		if (setting === 'dismissUsers' && dismissUsers) return msg.reject(msg.language.get('COMMAND_GREETINGS_ENABLE_ALREADYENABLED_DISMISS'));

		// Set the specified boolean to true.
		await msg.guild.settings.update(`greetings.${setting}`, true);

		return msg.affirm();
	}

	async disable(msg, [setting]) {
		// If a setting hasn't been specified, stop process and inform user.
		if (!setting) return msg.reject(msg.language.get('COMMAND_GREETINGS_DISABLE_NOSETTING'));

		// Set specified setting to lowercase and check if what user entered matches what we expect.
		setting = setting.toLowerCase();
		if (!['welcome', 'dismiss'].includes(setting)) return msg.reject(msg.language.get('COMMAND_GREETINGS_DISABLE_ONLY_WELCOME_DISMISS'));

		// Fetch relevant guild settings.
		const welcomeNewUsers = msg.guild.settings.get('greetings.welcomeNewUsers');
		const dismissUsers = msg.guild.settings.get('greetings.dismissUsers');

		// Check if the specified setting matches what we expect, then change the setting variable to what the config option is called.
		if (setting === 'welcome') setting = 'welcomeNewUsers';
		if (setting === 'dismiss') setting = 'dismissUsers';

		// If specified boolean is already false, stop process and inform user.
		if (setting === 'welcomeNewUsers' && !welcomeNewUsers) return msg.reject(msg.language.get('COMMAND_GREETINGS_DISABLE_ALREADYENABLED_WELCOME'));
		if (setting === 'dismissUsers' && !dismissUsers) return msg.reject(msg.language.get('COMMAND_GREETINGS_DISABLE_ALREADYENABLED_DISMISS'));

		// Set the specified boolean to false.
		await msg.guild.settings.update(`greetings.${setting}`, false);

		return msg.affirm();
	}

	async set(msg, [setting, subsetting, value]) {
		// If a setting hasn't been specified, stop process and inform user. Set specified setting to lowercase.
		if (!setting) return msg.reject(msg.language.get('COMMAND_GREETINGS_NOSETTING'));
		setting = setting.toLowerCase();

		// If specified setting doesn't match what we expect, stop process and inform user.
		if (!['welcome', 'dismiss'].includes(setting)) return msg.reject(msg.language.get('COMMAND_GREETINGS_NOSETTING'));
		// If specified setting is set but specified subsetting doesn't match what we expect, stop process and inform user.
		if (setting === 'welcome' && !['channel', 'message'].includes(subsetting)) return msg.reject(msg.language.get('COMMAND_GREETINGS_NOSUBSETTING_WELCOME'));
		if (setting === 'dismiss' && !['channel', 'message'].includes(subsetting)) return msg.reject(msg.language.get('COMMAND_GREETINGS_NOSUBSETTING_DISMISS'));

		// If a subsetting hasn't been specified, stop process and inform user. Set specified subsetting to lowercase.
		if (!subsetting) msg.reject(msg.language.get('COMMAND_GREETINGS_NOSETTING'));
		subsetting = subsetting.toLowerCase();

		// If specified subsetting is set but a value hasn't been specified, stop process and inform user.
		if (subsetting === 'channel' && !value) return msg.reject(msg.language.get('COMMAND_GREETINGS_NOVALUE_CHANNEL'));
		if (subsetting === 'message' && !value) return msg.reject(msg.language.get('COMMAND_GREETINGS_NOVALUE_MESSAGE'));

		// Fetch relevant guild settings.
		const welcomeChannel = msg.guild.settings.get('greetings.welcomeChannel');
		const welcomeMessage = msg.guild.settings.get('greetings.welcomeMessage');
		const dismissChannel = msg.guild.settings.get('greetings.dismissChannel');
		const dismissMessage = msg.guild.settings.get('greetings.dismissMessage');

		// Check if the specified setting and subsetting match what we expect, then change the setting variable to what the config option is called.
		if (setting === 'welcome' && subsetting === 'channel') subsetting = 'welcomeChannel';
		if (setting === 'welcome' && subsetting === 'message') subsetting = 'welcomeMessage';
		if (setting === 'dismiss' && subsetting === 'channel') subsetting = 'dismissChannel';
		if (setting === 'dismiss' && subsetting === 'message') subsetting = 'dismissMessage';

		// If specified config option is already set to the same value, stop process and inform user.
		if (subsetting === 'welcomeChannel' && value.id === welcomeChannel) return msg.reject(msg.language.get('COMMAND_GREETINGS_SET_WELCOMECHANNEL_SAMECHANNEL', value));
		if (subsetting === 'welcomeMessage' && value === welcomeMessage) return msg.reject(msg.language.get('COMMAND_GREETINGS_SET_WELCOMEMESSAGE_SAMEVALUE', value));
		if (subsetting === 'dismissChannel' && value.id === dismissChannel) return msg.reject(msg.language.get('COMMAND_GREETINGS_SET_DISMISSCHANNEL_SAMECHANNEL', value));
		if (subsetting === 'dismissMessage' && value === dismissMessage) return msg.reject(msg.language.get('COMMAND_GREETINGS_SET_DISMISSMESSAGE_SAMEVALUE', value));

		// Update specified config option.
		await msg.guild.settings.update(`greetings.${subsetting}`, value);

		return msg.affirm();
	}

	async reset(msg, [setting, subsetting]) {
		// If a setting hasn't been specified, stop process and inform user. Set specified setting to lowercase.
		if (!setting) return msg.reject(msg.language.get('COMMAND_GREETINGS_NOSETTING'));
		setting = setting.toLowerCase();

		// If specified setting doesn't match what we expect, stop process and inform user.
		if (!['welcome', 'dismiss'].includes(setting)) return msg.reject(msg.language.get('COMMAND_GREETINGS_NOSETTING'));
		// If specified setting is set but specified subsetting doesn't match what we expect, stop process and inform user.
		if (setting === 'welcome' && !['channel', 'message'].includes(subsetting)) return msg.reject(msg.language.get('COMMAND_GREETINGS_NOSUBSETTING_WELCOME'));
		if (setting === 'dismiss' && !['channel', 'message'].includes(subsetting)) return msg.reject(msg.language.get('COMMAND_GREETINGS_NOSUBSETTING_DISMISS'));

		// If a subsetting hasn't been specified, stop process and inform user. Set specified subsetting to lowercase.
		if (!subsetting) msg.reject(msg.language.get('COMMAND_GREETINGS_NOSETTING'));
		subsetting = subsetting.toLowerCase();

		// Fetch relevant guild settings.
		const welcomeChannel = msg.guild.settings.get('greetings.welcomeChannel');
		const welcomeMessage = msg.guild.settings.get('greetings.welcomeMessage');
		const dismissChannel = msg.guild.settings.get('greetings.dismissChannel');
		const dismissMessage = msg.guild.settings.get('greetings.dismissMessage');

		// Check if the specified setting and subsetting match what we expect, then change the setting variable to what the config option is called.
		if (setting === 'welcome' && subsetting === 'channel') subsetting = 'welcomeChannel';
		if (setting === 'welcome' && subsetting === 'message') subsetting = 'welcomeMessage';
		if (setting === 'dismiss' && subsetting === 'channel') subsetting = 'dismissChannel';
		if (setting === 'dismiss' && subsetting === 'message') subsetting = 'dismissMessage';

		// If specified config option hasn't been set, stop process and inform user.
		if (subsetting === 'welcomeChannel' && !welcomeChannel) return msg.reject(msg.language.get('COMMAND_GREETINGS_RESET_WELCOMECHANNEL_NOTSET'));
		if (subsetting === 'welcomeMessage' && !welcomeMessage) return msg.reject(msg.language.get('COMMAND_GREETINGS_RESET_WELCOMEMESSAGE_NOTSET'));
		if (subsetting === 'dismissChannel' && !dismissChannel) return msg.reject(msg.language.get('COMMAND_GREETINGS_RESET_DISMISSCHANNEL_NOTSET'));
		if (subsetting === 'dismissMessage' && !dismissMessage) return msg.reject(msg.language.get('COMMAND_GREETINGS_RESET_DISMISSMESSAGE_NOTSET'));

		// Reset specified config option.
		await msg.guild.settings.reset(`greetings.${subsetting}`);

		return msg.affirm();
	}

};
