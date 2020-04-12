const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			permissionLevel: 6,
			description: language => language.get('COMMAND_STARBOARD_DESCRIPTION'),
			runIn: ['text'],
			subcommands: true,
			usage: '<enable|disable|set|remove|reset|show:default> [threshold|channel|ignored] [value:number|value:channel]',
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

		const starboardEnabled = status[msg.guild.settings.get('boards.starboard.starboardEnabled')];
		const starboardThreshold = msg.guild.settings.get('boards.starboard.starboardThreshold');
		const starboardChannel = msg.guild.channels.get(msg.guild.settings.get('boards.starboard.starboardChannel')) || 'Not set';
		const starboardIgnoredChannels = msg.guild.settings.get('boards.starboard.starboardIgnoredChannels').map(channel => msg.guild.channels.get(channel)).join(', ') || 'None';

		const embed = new MessageEmbed()
			.setAuthor(msg.language.get('COMMAND_STARBOARD_SHOW_TITLE'), this.client.user.displayAvatarURL())
			.setColor(this.client.settings.get('colors.white'))
			.addField(msg.language.get('ENABLED'), starboardEnabled, true)
			.addField(msg.language.get('THRESHOLD'), starboardThreshold, true)
			.addField(msg.language.get('CHANNEL'), starboardChannel, true)
			.addField(msg.language.get('IGNORED_CHANNELS'), starboardIgnoredChannels)
			.setThumbnail(msg.guild.iconURL(), 50, 50)
			.setTimestamp()
			.setFooter(msg.language.get('COMMAND_REQUESTED_BY', msg), msg.author.displayAvatarURL());

		return msg.send('', { disableEveryone: true, embed: embed });
	}

	async enable(msg) {
		const starboardEnabled = msg.guild.settings.get('boards.starboard.starboardEnabled');

		if (starboardEnabled) return msg.reject(msg.language.get('COMMAND_STARBOARD_ENABLE_ALREADYENABLED'));

		await msg.guild.settings.update('boards.starboard.starboardEnabled', true);
		return msg.affirm(msg.language.get('COMMAND_STARBOARD_ENABLE_SUCCESS'));
	}

	async disable(msg) {
		const starboardEnabled = msg.guild.settings.get('boards.starboard.starboardEnabled');

		if (!starboardEnabled) return msg.reject(msg.language.get('COMMAND_STARBOARD_DISABLE_ALREADYDISABLED'));

		await msg.guild.settings.update('boards.starboard.starboardEnabled', false);
		return msg.affirm(msg.language.get('COMMAND_STARBOARD_DISABLE_SUCCESS'));
	}

	async set(msg, [setting, value]) {
		if (!value && setting === 'threshold') return msg.reject(msg.language.get('COMMAND_STARBOARD_NOVALUE_NUMBER'));
		if (!value && (setting === 'channel' || setting === 'ignored')) return msg.reject(msg.language.get('COMMAND_STARBOARD_NOVALUE_CHANNEL'));

		const starboardThreshold = msg.guild.settings.get('boards.starboard.starboardThreshold');
		const starboardChannel = msg.guild.settings.get('boards.starboard.starboardChannel');
		const starboardIgnoredChannels = msg.guild.settings.get('boards.starboard.starboardIgnoredChannels');

		if (setting === 'threshold') setting = 'starboardThreshold';
		if (setting === 'channel') setting = 'starboardChannel';
		if (setting === 'ignored') setting = 'starboardIgnoredChannels';

		if (setting === 'starboardThreshold' && value === starboardThreshold) return msg.reject(msg.language.get('COMMAND_STARBOARD_SET_THRESHOLD_SAMEVALUE', value));
		if (setting === 'starboardChannel' && value.id === starboardChannel) return msg.reject(msg.language.get('COMMAND_STARBOARD_SET_CHANNEL_SAMECHANNEL', value));
		if (setting === 'starboardIgnoredChannels' && starboardIgnoredChannels.includes(value.id)) return msg.reject(msg.language.get('COMMAND_STARBOARD_SET_IGNORED_ALREADYADDED', value));

		await msg.guild.settings.update(`boards.starboard.${setting}`, value);
		if (setting === 'starboardThreshold') return msg.affirm(msg.language.get('COMMAND_STARBOARD_SET_THRESHOLD_SUCCESS', value));
		if (setting === 'starboardChannel') return msg.affirm(msg.language.get('COMMAND_STARBOARD_SET_CHANNEL_SUCCESS', value));
		if (setting === 'starboardIgnoredChannels') return msg.affirm(msg.language.get('COMMAND_STARBOARD_SET_IGNORED_SUCCESS', value));

		return true;
	}

	async remove(msg, [setting, value]) {
		const starboardIgnoredChannels = msg.guild.settings.get('boards.starboard.starboardIgnoredChannels');

		if (setting !== 'ignored') return msg.reject(msg.language.get('COMMAND_STARBOARD_REMOVE_ONLYIGNORED'));
		if (!starboardIgnoredChannels.find(channel => channel === value.id)) {
			return msg.reject(msg.language.get('COMMAND_STARBOARD_REMOVE_NOTADDED', value));
		}

		await msg.guild.settings.update('boards.starboard.starboardIgnoredChannels', value, { action: 'remove' });
		return msg.affirm(msg.language.get('COMMAND_STARBOARD_REMOVE_SUCCESS', value));
	}

	async reset(msg, [setting]) {
		const starboardThreshold = msg.guild.settings.get('boards.starboard.starboardThreshold');
		const starboardChannel = msg.guild.settings.get('boards.starboard.starboardChannel');
		const starboardIgnoredChannels = msg.guild.settings.get('boards.starboard.starboardIgnoredChannels');

		if (setting === 'threshold') setting = 'starboardThreshold';
		if (setting === 'channel') setting = 'starboardChannel';
		if (setting === 'ignored') setting = 'starboardIgnoredChannels';

		if (setting === 'starboardThreshold' && starboardThreshold === 2) return msg.reject(msg.language.get('COMMAND_STARBOARD_RESET_THRESHOLD_DEFAULT'));
		if (setting === 'starboardChannel' && !starboardChannel) return msg.reject(msg.language.get('COMMAND_STARBOARD_RESET_CHANNEL_NOTSET'));
		if (setting === 'starboardIgnoredChannels' && !starboardIgnoredChannels.length) return msg.reject(msg.language.get('COMMAND_STARBOARD_RESET_IGNORED_NOTSET'));

		await msg.guild.settings.reset(`boards.starboard.${setting}`);
		if (setting === 'starboardThreshold') return msg.affirm(msg.language.get('COMMAND_STARBOARD_RESET_THRESHOLD_SUCCESS'));
		if (setting === 'starboardChannel') return msg.affirm(msg.language.get('COMMAND_STARBOARD_RESET_CHANNEL_SUCCESS'));
		if (setting === 'starboardIgnoredChannels') return msg.affirm(msg.language.get('COMMAND_STARBOARD_RESET_IGNORED_SUCCESS'));

		return true;
	}

};
