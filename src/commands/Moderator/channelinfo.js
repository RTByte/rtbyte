const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const { momentThreshold, timezoneWithDate } = require('../../lib/util/Util');
const moment = require('moment-timezone');

momentThreshold(moment);

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['cinfo'],
			permissionLevel: 6,
			requiredPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			runIn: ['text'],
			description: language => language.get('COMMAND_CHANNELINFO_DESCRIPTION'),
			usage: '[channel:channelname]'
		});
	}

	async run(msg, [channelname = msg.channel]) {
		const affirmEmoji = this.client.emojis.get(this.client.settings.get('emoji.affirm'));
		const rejectEmoji = this.client.emojis.get(this.client.settings.get('emoji.reject'));
		const status = {
			true: affirmEmoji,
			false: rejectEmoji
		};

		const embed = new MessageEmbed()
			.setColor(this.client.settings.get('colors.white'))
			.addField(msg.guild.language.get('NAME'), channelname.type !== 'voice' && channelname.type !== 'category' ? channelname : channelname.name, true)
			.addField(msg.guild.language.get('ID'), channelname.id, true)
			.addField(msg.language.get('COMMAND_CHANNELINFO_TYPE'), msg.language.get('COMMAND_CHANNELINFO_TYPES', channelname), true)
			.setThumbnail(msg.guild.iconURL(), 50, 50)
			.setTimestamp()
			.setFooter(msg.language.get('COMMAND_REQUESTED_BY', msg), msg.author.displayAvatarURL());

		if (channelname.type !== 'category' && channelname.type !== 'voice' && channelname.type !== 'store') {
			if (channelname.topic) embed.addField(msg.language.get('COMMAND_CHANNELINFO_TOPIC'), `\`${channelname.topic}\``, true);
			embed.addField(msg.language.get('NSFW'), status[channelname.nsfw], true);
			// eslint-disable-next-line max-len
			embed.addField(msg.language.get('COMMAND_CHANNELINFO_RATELIMIT'), channelname.rateLimitPerUser > 0 ? moment.duration(channelname.rateLimitPerUser, 's').humanize() : channelname.guild.language.get('OFF'), true);
		}

		if (channelname.type === 'voice') {
			embed.addField(msg.language.get('COMMAND_CHANNELINFO_BITRATE'), `${(channelname.bitrate / 1000).toFixed(0)} kbps`, true);
			embed.addField(msg.language.get('COMMAND_CHANNELINFO_USERLIMIT'), channelname.userLimit > 0 ? channelname.userLimit : msg.language.get('UNLIMITED'), true);
		}

		embed.addField(msg.guild.language.get('CREATED'), timezoneWithDate(channelname.createdTimestamp, msg.guild));
		await msg.send('', { disableEveryone: true, embed: embed });
		return;
	}

};
