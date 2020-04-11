const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			permissionLevel: 6,
			description: language => language.get('COMMAND_PINBOARD_DESCRIPTION'),
			runIn: ['text'],
			subcommands: true,
			usage: '<enable|disable|set|remove|reset|show:default> (channel|ignored) [specifiedChannel:channel]',
			usageDelim: ' '
		});
		this.createCustomResolver('channel', (arg, possible, message, [action]) => {
			if (!['set', 'reset'].includes(action)) return null;
			if (arg) return this.client.arguments.get('string').run(arg, possible, message);
			throw message.language.get('COMMAND_CONF_NOVALUE');
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
			.setAuthor('Pinboard settings', this.client.user.displayAvatarURL())
			.setColor(this.client.settings.get('colors.white'))
			.addField('On', pinboardEnabled, true)
			.addField('Channel', pinboardChannel, true)
			.addField('Ignored channels', pinboardIgnoredChannels)
			.setThumbnail(msg.guild.iconURL(), 50, 50)
			.setTimestamp()
			.setFooter(msg.language.get('COMMAND_REQUESTED_BY', msg), msg.author.displayAvatarURL());

		return msg.send('', { disableEveryone: true, embed: embed });
	}

	async enable(msg) {
		const pinboardEnabled = msg.guild.settings.get('boards.pinboard.pinboardEnabled');

		if (pinboardEnabled) return msg.reject('The pinboard is already enabled.');
 
		await msg.guild.settings.update('boards.pinboard.pinboardEnabled', true);
		return msg.affirm('Enabled the pinboard.');
	}

	async disable(msg) {
		const pinboardEnabled = msg.guild.settings.get('boards.pinboard.pinboardEnabled');

		if (!pinboardEnabled) return msg.reject('The pinboard is already disabled.');

		await msg.guild.settings.update('boards.pinboard.pinboardEnabled', false);
		return msg.affirm('Disabled the pinboard.');
	}

	async set(msg, [type, channel]) {
		console.log('working');
		console.log(type, channel.name);
	}

};
