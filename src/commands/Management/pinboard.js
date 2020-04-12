const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			permissionLevel: 6,
			description: language => language.get('COMMAND_PINBOARD_DESCRIPTION'),
			runIn: ['text'],
			subcommands: true,
			usage: '<enable|disable|set|remove|reset|show:default> [channel|ignored] [specifiedChannel:channel]',
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
		const pinboardChannel = msg.guild.channels.get(msg.guild.settings.get('boards.pinboard.pinboardChannel')) || 'Not set';
		const pinboardIgnoredChannels = msg.guild.settings.get('boards.pinboard.pinboardIgnoredChannels').map(channel => msg.guild.channels.get(channel)).join(', ') || 'None';

		const embed = new MessageEmbed()
			.setAuthor(msg.language.get('COMMAND_PINBOARD_SHOW_TITLE'), this.client.user.displayAvatarURL())
			.setColor(this.client.settings.get('colors.white'))
			.addField(msg.language.get('ENABLED'), pinboardEnabled, true)
			.addField(msg.language.get('CHANNEL'), pinboardChannel, true)
			.addField(msg.language.get('IGNORED_CHANNELS'), pinboardIgnoredChannels)
			.setThumbnail(msg.guild.iconURL(), 50, 50)
			.setTimestamp()
			.setFooter(msg.language.get('COMMAND_REQUESTED_BY', msg), msg.author.displayAvatarURL());

		return msg.send('', { disableEveryone: true, embed: embed });
	}

	async enable(msg) {
		const pinboardEnabled = msg.guild.settings.get('boards.pinboard.pinboardEnabled');

		if (pinboardEnabled) return msg.reject(msg.language.get('COMMAND_PINBOARD_ENABLE_ALREADYENABLED'));

		await msg.guild.settings.update('boards.pinboard.pinboardEnabled', true);
		return msg.affirm(msg.language.get('COMMAND_PINBOARD_ENABLE_SUCCESS'));
	}

	async disable(msg) {
		const pinboardEnabled = msg.guild.settings.get('boards.pinboard.pinboardEnabled');

		if (!pinboardEnabled) return msg.reject(msg.language.get('COMMAND_PINBOARD_DISABLE_ALREADYDISABLED'));

		await msg.guild.settings.update('boards.pinboard.pinboardEnabled', false);
		return msg.affirm(msg.language.get('COMMAND_PINBOARD_DISABLE_SUCCESS'));
	}

	async set(msg, [setting, specifiedChannel]) {
		const pinboardChannel = msg.guild.settings.get('boards.pinboard.pinboardChannel');
		const pinboardIgnoredChannels = msg.guild.settings.get('boards.pinboard.pinboardIgnoredChannels');

		if (setting === 'channel') setting = 'pinboardChannel';
		if (setting === 'ignored') setting = 'pinboardIgnoredChannels';

		if (specifiedChannel.id === pinboardChannel) return msg.reject(msg.language.get('COMMAND_PINBOARD_SET_CHANNEL_SAMECHANNEL', specifiedChannel));
		if (pinboardIgnoredChannels.includes(specifiedChannel.id)) return msg.reject(msg.language.get('COMMAND_PINBOARD_SET_IGNORED_ALREADYADDED', specifiedChannel));

		await msg.guild.settings.update(`boards.pinboard.${setting}`, specifiedChannel);
		if (setting === 'pinboardChannel') return msg.affirm(msg.language.get('COMMAND_PINBOARD_SET_CHANNEL_SUCCESS', specifiedChannel));
		if (setting === 'pinboardIgnoredChannels') return msg.affirm(msg.language.get('COMMAND_PINBOARD_SET_IGNORED_SUCCESS', specifiedChannel));

		return true;
	}

	async remove(msg, [setting, specifiedChannel]) {
		const pinboardIgnoredChannels = msg.guild.settings.get('boards.pinboard.pinboardIgnoredChannels');

		if (setting !== 'ignored') return msg.reject(msg.language.get('COMMAND_PINBOARD_REMOVE_ONLYIGNORED'));
		if (!pinboardIgnoredChannels.find(channel => channel === specifiedChannel.id)) {
			return msg.reject(msg.language.get('COMMAND_PINBOARD_REMOVE_NOTADDED', specifiedChannel));
		}

		await msg.guild.settings.update('boards.pinboard.pinboardIgnoredChannels', specifiedChannel, { action: 'remove' });
		return msg.affirm(msg.language.get('COMMAND_PINBOARD_REMOVE_SUCCESS', specifiedChannel));
	}

	async reset(msg, [setting]) {
		const pinboardChannel = msg.guild.settings.get('boards.pinboard.pinboardChannel');
		const pinboardIgnoredChannels = msg.guild.settings.get('boards.pinboard.pinboardIgnoredChannels');

		if (setting === 'channel') setting = 'pinboardChannel';
		if (setting === 'ignored') setting = 'pinboardIgnoredChannels';

		if (setting === 'pinboardChannel' && !pinboardChannel) return msg.reject(msg.language.get('COMMAND_PINBOARD_RESET_CHANNEL_NOTSET'));
		if (setting === 'pinboardIgnoredChannels' && !pinboardIgnoredChannels.length) return msg.reject(msg.language.get('COMMAND_PINBOARD_RESET_IGNORED_NOTSET'));

		await msg.guild.settings.reset(`boards.pinboard.${setting}`);
		if (setting === 'pinboardChannel') return msg.affirm(msg.language.get('COMMAND_PINBOARD_RESET_CHANNEL_SUCCESS'));
		if (setting === 'pinboardIgnoredChannels') return msg.affirm(msg.language.get('COMMAND_PINBOARD_RESET_IGNORED_SUCCESS'));

		return true;
	}

};
