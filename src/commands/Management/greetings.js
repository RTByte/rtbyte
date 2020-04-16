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
			usage: '<enable|disable|set|reset|show:default> [welcome|dismiss|welcomeChannel|dismissChannel|welcomeMessage|dismissMessage] [value:channel|value:...str]',
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

		const welcomeNewUsers = status[msg.guild.settings.get('greetings.welcomeNewUsers')];
		const welcomeChannel = msg.guild.channels.get(msg.guild.settings.get('greetings.welcomeChannel')) || msg.language.get('NOT_SET');
		const welcomeMessage = msg.guild.settings.get('greetings.welcomeMessage') ? msg.guild.settings.get('greetings.welcomeMessage').replace('%user%', '`@username`') : msg.language.get('NOT_SET');
		const dismissUsers = status[msg.guild.settings.get('greetings.dismissUsers')];
		const dismissChannel = msg.guild.channels.get(msg.guild.settings.get('greetings.dismissChannel')) || msg.language.get('NOT_SET');
		const dismissMessage = msg.guild.settings.get('greetings.dismissMessage') ? msg.guild.settings.get('greetings.dismissMessage').replace('%user%', '`@username`') : msg.language.get('NOT_SET');

		const embed = new MessageEmbed()
			.setAuthor(msg.language.get('COMMAND_GREETINGS_SHOW_TITLE'), this.client.user.displayAvatarURL())
			.setColor(this.client.settings.get('colors.white'))
			.addField(msg.language.get('COMMAND_GREETINGS_SHOW_WELCOMEENABLED'), welcomeNewUsers, true)
			.addField(msg.language.get('CHANNEL'), welcomeChannel, true)
			.addField(msg.language.get('MESSAGE'), welcomeMessage)
			.addBlankField()
			.addField(msg.language.get('COMMAND_GREETINGS_SHOW_DISMISSENABLED'), dismissUsers, true)
			.addField(msg.language.get('CHANNEL'), dismissChannel, true)
			.addField(msg.language.get('MESSAGE'), dismissMessage)
			.setThumbnail(msg.guild.iconURL(), 50, 50)
			.setTimestamp()
			.setFooter(msg.language.get('COMMAND_REQUESTED_BY', msg), msg.author.displayAvatarURL());

		return msg.send('', { disableEveryone: true, embed: embed });
	}

	async enable(msg, [setting]) {
		if (!setting) return msg.reject(msg.language.get('COMMAND_GREETINGS_ENABLE_NOSETTING'));

		setting = setting.toLowerCase();
		if (!['welcome', 'dismiss'].includes(setting)) return msg.reject(msg.language.get('COMMAND_GREETINGS_ENABLE_ONLY_WELCOME_DISMISS'));

		const welcomeNewUsers = msg.guild.settings.get('greetings.welcomeNewUsers');
		const dismissUsers = msg.guild.settings.get('greetings.dismissUsers');

		if (setting === 'welcome') setting = 'welcomeNewUsers';
		if (setting === 'dismiss') setting = 'dismissUsers';

		if (setting === 'welcomeNewUsers' && welcomeNewUsers) return msg.reject(msg.language.get('COMMAND_GREETINGS_ENABLE_ALREADYENABLED_WELCOME'));
		if (setting === 'dismissUsers' && dismissUsers) return msg.reject(msg.language.get('COMMAND_GREETINGS_ENABLE_ALREADYENABLED_DISMISS'));

		await msg.guild.settings.update(`greetings.${setting}`, true);

		return msg.affirm();
	}

	async disable(msg, [setting]) {
		if (!setting) return msg.reject(msg.language.get('COMMAND_GREETINGS_DISABLE_NOSETTING'));

		setting = setting.toLowerCase();
		if (!['welcome', 'dismiss'].includes(setting)) return msg.reject(msg.language.get('COMMAND_GREETINGS_DISABLE_ONLY_WELCOME_DISMISS'));

		const welcomeNewUsers = msg.guild.settings.get('greetings.welcomeNewUsers');
		const dismissUsers = msg.guild.settings.get('greetings.dismissUsers');

		if (setting === 'welcome') setting = 'welcomeNewUsers';
		if (setting === 'dismiss') setting = 'dismissUsers';

		if (setting === 'welcomeNewUsers' && !welcomeNewUsers) return msg.reject(msg.language.get('COMMAND_GREETINGS_DISABLE_ALREADYENABLED_WELCOME'));
		if (setting === 'dismissUsers' && !dismissUsers) return msg.reject(msg.language.get('COMMAND_GREETINGS_DISABLE_ALREADYENABLED_DISMISS'));

		await msg.guild.settings.update(`greetings.${setting}`, false);

		return msg.affirm();
	}

	async set(msg, [setting, value]) {
		if (!setting) return msg.reject(msg.language.get('COMMAND_GREETINGS_NOSETTING'));

		setting = setting.toLowerCase();
		if (!value && ['welcomechannel', 'dismisschannel'].includes(setting)) return msg.reject(msg.language.get('COMMAND_GREETINGS_NOVALUE_CHANNEL'));
		if (!value && ['welcomemessage', 'dismissmessage'].includes(setting)) return msg.reject(msg.language.get('COMMAND_GREETINGS_NOVALUE_MESSAGE'));
		if (!['welcomechannel', 'dismisschannel', 'welcomemessage', 'dismissmessage'].includes(setting)) {
			return msg.reject(msg.language.get('COMMAND_GREETINGS_ONLY_WELCCH_DISCH_WELCMSG_DISMSG'));
		}

		const welcomeChannel = msg.guild.settings.get('greetings.welcomeChannel');
		const welcomeMessage = msg.guild.settings.get('greetings.welcomeMessage');
		const dismissChannel = msg.guild.settings.get('greetings.dismissChannel');
		const dismissMessage = msg.guild.settings.get('greetings.dismissMessage');

		if (setting === 'welcomechannel') setting = 'welcomeChannel';
		if (setting === 'welcomemessage') setting = 'welcomeMessage';
		if (setting === 'dismisschannel') setting = 'dismissChannel';
		if (setting === 'dismissmessage') setting = 'dismissMessage';

		if (setting === 'welcomeChannel' && value.id === welcomeChannel) return msg.reject(msg.language.get('COMMAND_GREETINGS_SET_WELCOMECHANNEL_SAMECHANNEL', value));
		if (setting === 'welcomeMessage' && value === welcomeMessage) return msg.reject(msg.language.get('COMMAND_GREETINGS_SET_WELCOMEMESSAGE_SAMEVALUE', value));
		if (setting === 'dismissChannel' && value.id === dismissChannel) return msg.reject(msg.language.get('COMMAND_GREETINGS_SET_DISMISSCHANNEL_SAMECHANNEL', value));
		if (setting === 'dismissMessage' && value === dismissMessage) return msg.reject(msg.language.get('COMMAND_GREETINGS_SET_DISMISSMESSAGE_SAMEVALUE', value));

		await msg.guild.settings.update(`greetings.${setting}`, value);

		return msg.affirm();
	}

	async reset(msg, [setting]) {
		if (!setting) return msg.reject(msg.language.get('COMMAND_GREETINGS_NOSETTING'));

		setting = setting.toLowerCase();
		if (!['welcomechannel', 'dismisschannel', 'welcomemessage', 'dismissmessage'].includes(setting)) {
			return msg.reject(msg.language.get('COMMAND_GREETINGS_ONLY_WELCCH_DISCH_WELCMSG_DISMSG'));
		}

		const welcomeChannel = msg.guild.settings.get('greetings.welcomeChannel');
		const welcomeMessage = msg.guild.settings.get('greetings.welcomeMessage');
		const dismissChannel = msg.guild.settings.get('greetings.dismissChannel');
		const dismissMessage = msg.guild.settings.get('greetings.dismissMessage');

		if (setting === 'welcomechannel') setting = 'welcomeChannel';
		if (setting === 'welcomemessage') setting = 'welcomeMessage';
		if (setting === 'dismisschannel') setting = 'dismissChannel';
		if (setting === 'dismissmessage') setting = 'dismissMessage';

		if (setting === 'welcomeChannel' && !welcomeChannel) return msg.reject(msg.language.get('COMMAND_GREETINGS_RESET_WELCOMECHANNEL_NOTSET'));
		if (setting === 'welcomeMessage' && !welcomeMessage) return msg.reject(msg.language.get('COMMAND_GREETINGS_RESET_WELCOMEMESSAGE_NOTSET'));
		if (setting === 'dismissChannel' && !dismissChannel) return msg.reject(msg.language.get('COMMAND_GREETINGS_RESET_DISMISSCHANNEL_NOTSET'));
		if (setting === 'dismissMessage' && !dismissMessage) return msg.reject(msg.language.get('COMMAND_GREETINGS_RESET_DISMISSMESSAGE_NOTSET'));

		await msg.guild.settings.reset(`greetings.${setting}`);

		return msg.affirm();
	}

};
