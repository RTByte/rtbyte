const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const { momentThreshold, timezoneWithDate } = require('../../lib/util/Util');
const moment = require('moment-timezone');

momentThreshold(moment);

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['rinfo'],
			permissionLevel: 6,
			requiredPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			runIn: ['text'],
			description: language => language.get('COMMAND_ROLEINFO_DESCRIPTION'),
			usage: '[role:rolename]'
		});
	}

	async run(msg, [rolename = msg.member.roles.first()]) {
		const perms = {
			ADMINISTRATOR: msg.language.get('PERMISSIONS_ADMINISTRATOR'),
			VIEW_AUDIT_LOG: msg.language.get('PERMISSIONS_VIEW_AUDIT_LOG'),
			MANAGE_GUILD: msg.language.get('PERMISSIONS_MANAGE_GUILD'),
			MANAGE_ROLES: msg.language.get('PERMISSIONS_MANAGE_ROLES'),
			MANAGE_CHANNELS: msg.language.get('PERMISSIONS_MANAGE_CHANNELS'),
			KICK_MEMBERS: msg.language.get('PERMISSIONS_KICK_MEMBERS'),
			BAN_MEMBERS: msg.language.get('PERMISSIONS_BAN_MEMBERS'),
			CREATE_INSTANT_INVITE: msg.language.get('PERMISSIONS_CREATE_INSTANT_INVITE'),
			CHANGE_NICKNAME: msg.language.get('PERMISSIONS_CHANGE_NICKNAME'),
			MANAGE_NICKNAMES: msg.language.get('PERMISSIONS_MANAGE_NICKNAMES'),
			MANAGE_EMOJIS: msg.language.get('PERMISSIONS_MANAGE_EMOJIS'),
			MANAGE_WEBHOOKS: msg.language.get('PERMISSIONS_MANAGE_WEBHOOKS'),
			VIEW_CHANNEL: msg.language.get('PERMISSIONS_VIEW_CHANNEL'),
			SEND_MESSAGES: msg.language.get('PERMISSIONS_SEND_MESSAGES'),
			SEND_TTS_MESSAGES: msg.language.get('PERMISSIONS_SEND_TTS_MESSAGES'),
			MANAGE_MESSAGES: msg.language.get('PERMISSIONS_MANAGE_MESSAGES'),
			EMBED_LINKS: msg.language.get('PERMISSIONS_EMBED_LINKS'),
			ATTACH_FILES: msg.language.get('PERMISSIONS_ATTACH_FILES'),
			READ_MESSAGE_HISTORY: msg.language.get('PERMISSIONS_READ_MESSAGE_HISTORY'),
			MENTION_EVERYONE: msg.language.get('PERMISSIONS_MENTION_EVERYONE'),
			USE_EXTERNAL_EMOJIS: msg.language.get('PERMISSIONS_USE_EXTERNAL_EMOJIS'),
			ADD_REACTIONS: msg.language.get('PERMISSIONS_ADD_REACTIONS'),
			CONNECT: msg.language.get('PERMISSIONS_CONNECT'),
			SPEAK: msg.language.get('PERMISSIONS_SPEAK'),
			MUTE_MEMBERS: msg.language.get('PERMISSIONS_MUTE_MEMBERS'),
			DEAFEN_MEMBERS: msg.language.get('PERMISSIONS_DEAFEN_MEMBERS'),
			MOVE_MEMBERS: msg.language.get('PERMISSIONS_MOVE_MEMBERS'),
			USE_VAD: msg.language.get('PERMISSIONS_USE_VAD'),
			PRIORITY_SPEAKER: msg.language.get('PERMISSIONS_PRIORITY_SPEAKER'),
			STREAM: msg.language.get('PERMISSIONS_STREAM')
		};
		const permissions = Object.entries(rolename.permissions.serialize()).filter(perm => perm[1]).map(([perm]) => perms[perm]).join(', ');
		const affirmEmoji = this.client.emojis.get(this.client.settings.get('emoji.affirm'));
		const rejectEmoji = this.client.emojis.get(this.client.settings.get('emoji.reject'));
		const status = {
			true: affirmEmoji,
			false: rejectEmoji
		};

		const embed = new MessageEmbed()
			.setColor(this.client.settings.get('colors.white'))
			.addField(msg.guild.language.get('NAME'), rolename, true)
			.addField(msg.guild.language.get('ID'), rolename.id, true)
			.addField(msg.guild.language.get('MEMBERS'), rolename.members.size, true)
			.addField(msg.language.get('COMMAND_ROLEINFO_COLOR'), rolename.hexColor !== '#000000' ? rolename.hexColor : 'No color', true)
			.addField(msg.language.get('COMMAND_ROLEINFO_MENTIONABLE'), status[rolename.mentionable], true)
			.addField(msg.language.get('COMMAND_ROLEINFO_HOIST'), status[rolename.hoist], true)
			.addField(msg.language.get('COMMAND_ROLEINFO_MANAGED'), status[rolename.managed], true)
			.addField(msg.guild.language.get('CREATED'), timezoneWithDate(rolename.createdTimestamp, msg.guild))
			.addField(msg.language.get('COMMAND_ROLEINFO_PERMISSIONS'), `\`${permissions || 'None'}\``)
			.setThumbnail(msg.guild.iconURL(), 50, 50)
			.setTimestamp()
			.setFooter(msg.language.get('COMMAND_REQUESTED_BY', msg), msg.author.displayAvatarURL());


		await msg.send('', { disableEveryone: true, embed: embed });
		return;
	}

};
