const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const { Colors, Emojis } = require('../../lib/util/constants');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['twitchnotif', 'twitchnotifications'],
			permissionLevel: 6,
			description: language => language.get('COMMAND_TWITCHNOTIFS_DESCRIPTION'),
			runIn: ['text'],
			subcommands: true,
			usage: '<enable|disable|set|remove|reset|show:default> [channel|role|streamers] [value:channelname|value:rolename|value:...str]',
			usageDelim: ' '
		});
	}

	async show(msg) {
		const affirmEmoji = this.client.emojis.cache.get(Emojis.affirm);
		const rejectEmoji = this.client.emojis.cache.get(Emojis.reject);
		const status = {
			true: affirmEmoji,
			false: rejectEmoji
		};

		const twitchNotifsEnabled = status[msg.guild.settings.get('twitch.twitchNotifsEnabled')];
		const twitchNotifsChannel = msg.guild.channels.cache.get(msg.guild.settings.get('twitch.twitchNotifsChannel')) || msg.language.get('NOT_SET');
		// Unused for now
		/* const twitchNotifsRole = msg.guild.roles.get(msg.guild.settings.get('twitch.twitchNotifsRole')) || msg.language.get('NOT_SET'); */
		const streamers = msg.guild.settings.get('twitch.streamers').map(streamer => `\`${streamer.name}\``).join(', ') || msg.language.get('NONE');

		const embed = new MessageEmbed()
			.setAuthor(msg.language.get('COMMAND_TWITCHNOTIFS_SHOW_TITLE'), this.client.user.displayAvatarURL())
			.setColor(Colors.white)
			.addField(msg.language.get('ENABLED'), twitchNotifsEnabled)
			.addField(msg.language.get('COMMAND_TWITCHNOTIFS_SHOW_CHANNEL'), twitchNotifsChannel, true)
			.addField(msg.language.get('COMMAND_TWITCHNOTIFS_SHOW_STREAMERS'), streamers)
			.setThumbnail(msg.guild.iconURL(), 50, 50)
			.setTimestamp()
			.setFooter(msg.language.get('COMMAND_REQUESTED_BY', msg), msg.author.displayAvatarURL());

		return msg.send('', { embed: embed });
	}

	async enable(msg) {
		const twitchNotifsEnabled = msg.guild.settings.get('twitch.twitchNotifsEnabled');

		if (twitchNotifsEnabled) return msg.reject(msg.language.get('COMMAND_TWITCHNOTIFS_ENABLE_ALREADYENABLED'));

		await msg.guild.settings.update('twitch.twitchNotifsEnabled', true);

		const schedule = await this.client.schedule.create('twitchNotifications', '*/5 * * * *', {
			data: {
				guildID: msg.guild.id
			}
		});
		await msg.guild.settings.update('twitch.twitchTaskID', schedule.id);

		return msg.affirm();
	}

	async disable(msg) {
		const starboardEnabled = msg.guild.settings.get('twitch.twitchNotifsEnabled');

		if (!starboardEnabled) return msg.reject(msg.language.get('COMMAND_TWITCHNOTIFS_ENABLE_ALREADYENABLED'));

		await msg.guild.settings.update('twitch.twitchNotifsEnabled', false);
		this.client.schedule.delete(msg.guild.settings.get('twitch.twitchTaskID'));

		await msg.guild.settings.reset('twitch.twitchTaskID');

		return msg.affirm();
	}

	async set(msg, [setting, value]) {
		if (!setting) return msg.reject(msg.language.get('COMMAND_TWITCHNOTIFS_NOSETTING'));

		setting = setting.toLowerCase();
		if (!value && setting === 'channel') return msg.reject(msg.language.get('COMMAND_TWITCHNOTIFS_NOVALUE_CHANNEL'));
		if (!value && setting === 'role') return msg.reject(msg.language.get('COMMAND_TWITCHNOTIFS_NOVALUE_ROLE'));
		if (!value && setting === 'streamers') return msg.reject(msg.language.get('COMMAND_TWITCHNOTIFS_NOVALUE_STREAMERS'));

		const twitchNotifsChannel = msg.guild.settings.get('twitch.twitchNotifsChannel');
		const twitchNotifsRole = msg.guild.settings.get('twitch.twitchNotifsRole');
		const streamers = msg.guild.settings.get('twitch.streamers');

		if (setting === 'channel') setting = 'twitchNotifsChannel';
		if (setting === 'role') setting = 'twitchNotifsRole';

		if (setting === 'twitchNotifsChannel' && value.id === twitchNotifsChannel) return msg.reject(msg.language.get('COMMAND_TWITCHNOTIFS_SET_CHANNEL_SAMEVALUE', value));
		if (setting === 'twitchNotifsRole' && value.id === twitchNotifsRole) return msg.reject(msg.language.get('COMMAND_TWITCHNOTIFS_SET_ROLE_SAMECHANNEL', value));
		if (setting === 'streamers' && streamers.includes(value)) return msg.reject(msg.language.get('COMMAND_TWITCHNOTIFS_SET_STREAMERS_ALREADYADDED', value));

		if (['twitchNotifsChannel', 'twitchNotifsRole'].includes(setting)) await msg.guild.settings.update(`twitch.${setting}`, value);
		if (setting === 'streamers') await msg.guild.settings.update(`twitch.${setting}`, { name: value, latestStream: 0 });

		return msg.affirm();
	}

	async remove(msg, [setting, value]) {
		if (!setting) return msg.reject(msg.language.get('COMMAND_TWITCHNOTIFS_REMOVE_NOSETTING'));

		setting = setting.toLowerCase();
		if (!value && setting === 'streamers') return msg.reject(msg.language.get('COMMAND_TWITCHNOTIFS_NOVALUE_STREAMERS'));

		const streamers = msg.guild.settings.get('twitch.streamers');

		if (setting !== 'streamers') return msg.reject(msg.language.get('COMMAND_TWITCHNOTIFS_REMOVE_ONLYSTREAMER'));
		if (!streamers.find(streamer => streamer.name.toLowerCase() === value.toLowerCase())) {
			return msg.reject(msg.language.get('COMMAND_TWITCHNOTIFS_REMOVE_NOTADDED', value));
		}

		const streamer = streamers.find(str => str.name.toLowerCase() === value);

		await msg.guild.settings.update('twitch.streamers', streamer, { action: 'remove' });

		return msg.affirm();
	}

	async reset(msg, [setting]) {
		if (!setting) return msg.reject(msg.language.get('COMMAND_TWITCHNOTIFS_NOSETTING'));

		setting = setting.toLowerCase();

		const twitchNotifsChannel = msg.guild.settings.get('twitch.twitchNotifsChannel');
		const twitchNotifsRole = msg.guild.settings.get('twitch.twitchNotifsRole');
		const streamers = msg.guild.settings.get('twitch.streamers');

		if (setting === 'channel') setting = 'twitchNotifsChannel';
		if (setting === 'role') setting = 'twitchNotifsRole';

		if (setting === 'twitchNotifsChannel' && !twitchNotifsChannel) return msg.reject(msg.language.get('COMMAND_TWITCHNOTIFS_RESET_CHANNEL_NOTSET'));
		if (setting === 'twitchNotifsRole' && !twitchNotifsRole) return msg.reject(msg.language.get('COMMAND_TWITCHNOTIFS_RESET_ROLE_NOTSET'));
		if (setting === 'streamers' && !streamers.length) return msg.reject(msg.language.get('COMMAND_TWITCHNOTIFS_RESET_STREAMERS_NOTSET'));

		await msg.guild.settings.reset(`twitch.${setting}`);

		return msg.affirm();
	}

};
