const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'roleUpdate' });
		this.perms = {
			ADMINISTRATOR: 'Administrator',
			VIEW_AUDIT_LOG: 'View Audit Log',
			MANAGE_GUILD: 'Manage Server',
			MANAGE_ROLES: 'Manage Roles',
			MANAGE_CHANNELS: 'Manage Channels',
			KICK_MEMBERS: 'Kick Members',
			BAN_MEMBERS: 'Ban Members',
			CREATE_INSTANT_INVITE: 'Create Instant Invite',
			CHANGE_NICKNAME: 'Change Nickname',
			MANAGE_NICKNAMES: 'Manage Nicknames',
			MANAGE_EMOJIS: 'Manage Emojis',
			MANAGE_WEBHOOKS: 'Manage Webhooks',
			VIEW_CHANNEL: 'Read Text Channels and See Voice Channels',
			SEND_MESSAGES: 'Send Messages',
			SEND_TTS_MESSAGES: 'Send TTS Messages',
			MANAGE_MESSAGES: 'Manage Messages',
			EMBED_LINKS: 'Embed Links',
			ATTACH_FILES: 'Attach Files',
			READ_MESSAGE_HISTORY: 'Read Message History',
			MENTION_EVERYONE: 'Mention Everyone',
			USE_EXTERNAL_EMOJIS: 'Use External Emojis',
			ADD_REACTIONS: 'Add Reactions',
			CONNECT: 'Connect',
			SPEAK: 'Speak',
			MUTE_MEMBERS: 'Mute Members',
			DEAFEN_MEMBERS: 'Deafen Members',
			MOVE_MEMBERS: 'Move Members',
			USE_VAD: 'Use Voice Activity',
			PRIORITY_SPEAKER: 'Priority Speaker'
		};
	}

	async run(oldRole, role) {
		if (role.guild.available && role.guild.settings.logs.events.roleUpdate) await this.roleUpdateLog(oldRole, role);

		return;
	}

	async roleUpdateLog(oldRole, role) {
		const affirmEmoji = this.client.emojis.get(this.client.settings.emoji.affirm);
		const rejectEmoji = this.client.emojis.get(this.client.settings.emoji.reject);
		const arrowRightEmoji = this.client.emojis.get(this.client.settings.emoji.arrowRight);
		const oldPermissions = Object.entries(oldRole.permissions.serialize()).filter(perm => perm[1]).map(([perm]) => this.perms[perm]).join(', ');
		const newPermissions = Object.entries(role.permissions.serialize()).filter(perm => perm[1]).map(([perm]) => this.perms[perm]).join(', ');
		const status = {
			true: affirmEmoji,
			false: rejectEmoji
		};

		const embed = new MessageEmbed()
			.setAuthor(`${role.name}`, role.guild.iconURL())
			.setColor(this.client.settings.colors.blue)
			.setTimestamp()
			.setFooter(role.guild.language.get('GUILD_LOG_ROLEUPDATE'));

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
