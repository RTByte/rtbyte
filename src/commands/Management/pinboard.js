const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			permissionLevel: 6,
			description: language => language.get('COMMAND_PINBOARD_DESCRIPTION'),
			runIn: ['text'],
			subcommands: true,
			usage: '<enable|disable|set|remove|reset|show:default> [channel|ignored] [value:channel]',
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

		const pinboardEnabled = status[msg.guild.settings.get('boards.pinboard.pinboardEnabled')];
		const pinboardChannel = msg.guild.channels.get(msg.guild.settings.get('boards.pinboard.pinboardChannel')) || msg.language.get('NOT_SET');
		const pinboardIgnoredChannels = msg.guild.settings.get('boards.pinboard.pinboardIgnoredChannels').map(channel => msg.guild.channels.get(channel)).join(', ') || msg.language.get('NONE');

		const embed = new MessageEmbed()
			.setAuthor(msg.language.get('COMMAND_PINBOARD_SHOW_TITLE'), this.client.user.displayAvatarURL())
			.setColor(this.client.settings.get('colors.white'))
			.addField(msg.language.get('ENABLED'), pinboardEnabled, true)
			.addField(msg.language.get('COMMAND_MANAGEMENT_SHOW_CHANNEL'), pinboardChannel, true)
			.addField(msg.language.get('COMMAND_MANAGEMENT_SHOW_IGNORED'), pinboardIgnoredChannels)
			.setThumbnail(msg.guild.iconURL(), 50, 50)
			.setTimestamp()
			.setFooter(msg.language.get('COMMAND_REQUESTED_BY', msg), msg.author.displayAvatarURL());

		return msg.send('', { disableEveryone: true, embed: embed });
	}

	async enable(msg) {
		const pinboardEnabled = msg.guild.settings.get('boards.pinboard.pinboardEnabled');

		if (pinboardEnabled) return msg.reject(msg.language.get('COMMAND_PINBOARD_ENABLE_ALREADYENABLED'));

		await msg.guild.settings.update('boards.pinboard.pinboardEnabled', true);

		return msg.affirm();
	}

	async disable(msg) {
		const pinboardEnabled = msg.guild.settings.get('boards.pinboard.pinboardEnabled');

		if (!pinboardEnabled) return msg.reject(msg.language.get('COMMAND_PINBOARD_DISABLE_ALREADYDISABLED'));

		await msg.guild.settings.update('boards.pinboard.pinboardEnabled', false);

		return msg.affirm();
	}

	async set(msg, [setting, value]) {
		if (!setting) return msg.reject(msg.language.get('COMMAND_PINBOARD_NOSETTING'));

		setting = setting.toLowerCase();
		if (!value && ['channel', 'ignored'].includes(setting)) return msg.reject(msg.language.get('COMMAND_PINBOARD_NOVALUE_CHANNEL'));

		const pinboardChannel = msg.guild.settings.get('boards.pinboard.pinboardChannel');
		const pinboardIgnoredChannels = msg.guild.settings.get('boards.pinboard.pinboardIgnoredChannels');

		if (setting === 'channel') setting = 'pinboardChannel';
		if (setting === 'ignored') setting = 'pinboardIgnoredChannels';

		if (value.id === pinboardChannel) return msg.reject(msg.language.get('COMMAND_PINBOARD_SET_CHANNEL_SAMECHANNEL', value));
		if (pinboardIgnoredChannels.includes(value.id)) return msg.reject(msg.language.get('COMMAND_PINBOARD_SET_IGNORED_ALREADYADDED', value));

		await msg.guild.settings.update(`boards.pinboard.${setting}`, value);

		return msg.affirm();
	}

	async remove(msg, [setting, value]) {
		if (!setting) return msg.reject(msg.language.get('COMMAND_PINBOARD_NOSETTING'));

		setting = setting.toLowerCase();
		if (!value && setting === 'ignored') return msg.reject(msg.language.get('COMMAND_PINBOARD_NOVALUE_CHANNEL'));

		const pinboardIgnoredChannels = msg.guild.settings.get('boards.pinboard.pinboardIgnoredChannels');

		if (setting !== 'ignored') return msg.reject(msg.language.get('COMMAND_PINBOARD_REMOVE_ONLYIGNORED'));
		if (!pinboardIgnoredChannels.find(channel => channel === value.id)) {
			return msg.reject(msg.language.get('COMMAND_PINBOARD_REMOVE_NOTADDED', value));
		}

		await msg.guild.settings.update('boards.pinboard.pinboardIgnoredChannels', value, { action: 'remove' });

		return msg.affirm();
	}

	async reset(msg, [setting]) {
		if (!setting) return msg.reject(msg.language.get('COMMAND_PINBOARD_NOSETTING'));

		setting = setting.toLowerCase();

		const pinboardChannel = msg.guild.settings.get('boards.pinboard.pinboardChannel');
		const pinboardIgnoredChannels = msg.guild.settings.get('boards.pinboard.pinboardIgnoredChannels');

		if (setting === 'channel') setting = 'pinboardChannel';
		if (setting === 'ignored') setting = 'pinboardIgnoredChannels';

		if (setting === 'pinboardChannel' && !pinboardChannel) return msg.reject(msg.language.get('COMMAND_PINBOARD_RESET_CHANNEL_NOTSET'));
		if (setting === 'pinboardIgnoredChannels' && !pinboardIgnoredChannels.length) return msg.reject(msg.language.get('COMMAND_PINBOARD_RESET_IGNORED_NOTSET'));

		await msg.guild.settings.reset(`boards.pinboard.${setting}`);

		return msg.affirm();
	}

};
