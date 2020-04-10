const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'roleUpdate' });
	}

	async run(oldRole, role) {
		if (!role.guild) return;

		let executor;
		if (role.guild.me.hasPermission('VIEW_AUDIT_LOG')) {
			const auditLog = await role.guild.fetchAuditLogs();
			const logEntry = await auditLog.entries.first();

			if (logEntry.action === 'ROLE_UPDATE') executor = logEntry ? logEntry.executor : undefined;
		}

		const perms = {
			ADMINISTRATOR: role.guild.language.get('PERMISSIONS_ADMINISTRATOR'),
			VIEW_AUDIT_LOG: role.guild.language.get('PERMISSIONS_VIEW_AUDIT_LOG'),
			MANAGE_GUILD: role.guild.language.get('PERMISSIONS_MANAGE_GUILD'),
			MANAGE_ROLES: role.guild.language.get('PERMISSIONS_MANAGE_ROLES'),
			MANAGE_CHANNELS: role.guild.language.get('PERMISSIONS_MANAGE_CHANNELS'),
			KICK_MEMBERS: role.guild.language.get('PERMISSIONS_KICK_MEMBERS'),
			BAN_MEMBERS: role.guild.language.get('PERMISSIONS_BAN_MEMBERS'),
			CREATE_INSTANT_INVITE: role.guild.language.get('PERMISSIONS_CREATE_INSTANT_INVITE'),
			CHANGE_NICKNAME: role.guild.language.get('PERMISSIONS_CHANGE_NICKNAME'),
			MANAGE_NICKNAMES: role.guild.language.get('PERMISSIONS_MANAGE_NICKNAMES'),
			MANAGE_EMOJIS: role.guild.language.get('PERMISSIONS_MANAGE_EMOJIS'),
			MANAGE_WEBHOOKS: role.guild.language.get('PERMISSIONS_MANAGE_WEBHOOKS'),
			VIEW_CHANNEL: role.guild.language.get('PERMISSIONS_VIEW_CHANNEL'),
			SEND_MESSAGES: role.guild.language.get('PERMISSIONS_SEND_MESSAGES'),
			SEND_TTS_MESSAGES: role.guild.language.get('PERMISSIONS_SEND_TTS_MESSAGES'),
			MANAGE_MESSAGES: role.guild.language.get('PERMISSIONS_MANAGE_MESSAGES'),
			EMBED_LINKS: role.guild.language.get('PERMISSIONS_EMBED_LINKS'),
			ATTACH_FILES: role.guild.language.get('PERMISSIONS_ATTACH_FILES'),
			READ_MESSAGE_HISTORY: role.guild.language.get('PERMISSIONS_READ_MESSAGE_HISTORY'),
			MENTION_EVERYONE: role.guild.language.get('PERMISSIONS_MENTION_EVERYONE'),
			USE_EXTERNAL_EMOJIS: role.guild.language.get('PERMISSIONS_USE_EXTERNAL_EMOJIS'),
			ADD_REACTIONS: role.guild.language.get('PERMISSIONS_ADD_REACTIONS'),
			CONNECT: role.guild.language.get('PERMISSIONS_CONNECT'),
			SPEAK: role.guild.language.get('PERMISSIONS_SPEAK'),
			MUTE_MEMBERS: role.guild.language.get('PERMISSIONS_MUTE_MEMBERS'),
			DEAFEN_MEMBERS: role.guild.language.get('PERMISSIONS_DEAFEN_MEMBERS'),
			MOVE_MEMBERS: role.guild.language.get('PERMISSIONS_MOVE_MEMBERS'),
			USE_VAD: role.guild.language.get('PERMISSIONS_USE_VAD'),
			PRIORITY_SPEAKER: role.guild.language.get('PERMISSIONS_PRIORITY_SPEAKER'),
			STREAM: role.guild.language.get('PERMISSIONS_STREAM')
		};

		if (role.guild.settings.channels.log && role.guild.settings.logs.events.roleUpdate) await this.serverLog(oldRole, role, executor, perms);

		return;
	}

	async serverLog(oldRole, role, executor, perms) {
		const affirmEmoji = this.client.emojis.get(this.client.settings.emoji.affirm);
		const rejectEmoji = this.client.emojis.get(this.client.settings.emoji.reject);
		const arrowRightEmoji = this.client.emojis.get(this.client.settings.emoji.arrowRight);
		const oldPermissions = Object.entries(oldRole.permissions.serialize()).filter(perm => perm[1]).map(([perm]) => perms[perm]).join(', ');
		const newPermissions = Object.entries(role.permissions.serialize()).filter(perm => perm[1]).map(([perm]) => perms[perm]).join(', ');
		const status = {
			true: affirmEmoji,
			false: rejectEmoji
		};

		const embed = new MessageEmbed()
			.setAuthor(`${role.name}`, role.guild.iconURL())
			.setColor(this.client.settings.colors.blue)
			.setTimestamp()
			.setFooter(role.guild.language.get('GUILD_LOG_ROLEUPDATE', executor), executor ? executor.displayAvatarURL() : undefined);

		// Name changed
		if (oldRole.name !== role.name) embed.addField(role.guild.language.get('NAME_CHANGED'), `${oldRole.name} ${arrowRightEmoji} ${role.name}`);

		// Color changed
		if (oldRole.color !== role.color) embed.addField(role.guild.language.get('GUILD_LOG_ROLEUPDATE_COLOR'), `${oldRole.hexColor} ${arrowRightEmoji} ${role.hexColor}`);

		// Hoist toggled
		if (oldRole.hoist !== role.hoist) embed.addField(role.guild.language.get('GUILD_LOG_ROLEUPDATE_HOIST'), status[role.hoist]);

		// Mentionable toggled
		if (oldRole.mentionable !== role.mentionable) embed.addField(role.guild.language.get('GUILD_LOG_ROLEUPDATE_MENTIONABLE'), status[role.mentionable]);

		// Permissions changed
		// eslint-disable-next-line max-len
		if (oldRole.permissions.bitfield !== role.permissions.bitfield && oldPermissions !== newPermissions) embed.addField(role.guild.language.get('GUILD_LOG_ROLEUPDATE_PERMISSIONS'), `\`${oldPermissions || 'None'}\`\n\n ${arrowRightEmoji} \n\n\`${newPermissions || 'None'}\``);

		if (!embed.fields.length) return;

		const logChannel = await this.client.channels.get(role.guild.settings.channels.log);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

};
