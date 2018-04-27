const { Extendable } = require('klasa');

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, {
			name: 'init',
			enabled: true,
			appliesTo: ['Guild'],
			klasa: false
		});
	}

	async extend(type = null) {
		if (!this.available) return;

		await this.client.emit('verbose', `Initializing Guild: ${this.name} (${this.id})`);

		// Creating necessary roles on new Guild
		const adminRole = await this.roles.create({ data: { name: 'Admin' }, reason: `${this.client.user.username} initialization: Admin Role` });
		const modRole = await this.roles.create({ data: { name: 'Moderator' }, reason: `${this.client.user.username} initialization: Moderator Role` });
		const voiceBannedRole = await this.roles.create({ data: { name: 'Voice Chat Banned' }, reason: `${this.client.user.username} initialization: Voice Chat Banned Role` });
		const mutedRole = await this.roles.create({ data: { name: 'Muted' }, reason: `${this.client.user.username} initialization: Muted Role` });

		// Adding necessary roles to Guild Configs
		await this.configs.update({ roles: { administrator: adminRole, moderator: modRole, voiceBanned: voiceBannedRole, muted: mutedRole } }, this);

		await this.configs.sync(true);

		// Creating Log Channel
		const logChannel = await this.channels.create('server-log', {
			type: 'text',
			topic: `Activity log for ${this.client.user.username}`,
			reason: `${this.client.user.username} initialization: Log Channel`
		});

		// Adding log channel into Guild Configs
		await this.configs.update({ channels: { serverLog: logChannel } }, this);

		// Giving the guild owner the rank of Administrator
		await this.owner.roles.add(adminRole, `${this.client.user.username} initialization: Granting Guild Owner Admin Status`);

		// Removing respective permissions for Muted and Voice Banned roles
		await this.channels.forEach(async (channel) => {
			if (channel.type === 'text') {
				// Removing permissions for mutedRole in text channels
				await channel.overwritePermissions({
					overwrites: [{ id: mutedRole.id, denied: ['CREATE_INSTANT_INVITE', 'ADD_REACTIONS', 'SEND_MESSAGES', 'SEND_TTS_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES', 'USE_EXTERNAL_EMOJIS'] }],
					reason: `${this.client.user.username} initialization: Denying text channel permissions for Muted Role`
				});
			}

			if (channel.type === 'voice') {
				// Removing permissions for mutedRole and voiceBannedRole in voice channels
				await channel.overwritePermissions({
					overwrites: [
						{ id: mutedRole.id, denied: ['SPEAK'] },
						{ id: voiceBannedRole.id, denied: ['CONNECT', 'SPEAK'] }],
					reason: `${this.client.user.username} initialization: Denying voice channel permissions for Muted and Voice Chat Banned Roles`
				});
			}
		});

		// Removing respective permissions for server log channel
		await logChannel.overwritePermissions({
			overwrites: [
				// eslint-disable-next-line max-len
				{ id: this.client.user.id, allowed: ['CREATE_INSTANT_INVITE', 'MANAGE_CHANNELS', 'ADD_REACTIONS', 'VIEW_CHANNEL', 'SEND_MESSAGES', 'SEND_TTS_MESSAGES', 'MANAGE_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES', 'READ_MESSAGE_HISTORY', 'MENTION_EVERYONE', 'USE_EXTERNAL_EMOJIS', 'MANAGE_ROLES', 'MANAGE_WEBHOOKS'] },
				// eslint-disable-next-line max-len
				{ id: this.defaultRole.id, denied: ['CREATE_INSTANT_INVITE', 'MANAGE_CHANNELS', 'ADD_REACTIONS', 'VIEW_CHANNEL', 'SEND_MESSAGES', 'SEND_TTS_MESSAGES', 'MANAGE_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES', 'READ_MESSAGE_HISTORY', 'MENTION_EVERYONE', 'USE_EXTERNAL_EMOJIS', 'MANAGE_ROLES', 'MANAGE_WEBHOOKS'] },
				// eslint-disable-next-line max-len
				{ id: adminRole.id, allowed: ['CREATE_INSTANT_INVITE', 'MANAGE_CHANNELS', 'ADD_REACTIONS', 'VIEW_CHANNEL', 'SEND_MESSAGES', 'SEND_TTS_MESSAGES', 'MANAGE_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES', 'READ_MESSAGE_HISTORY', 'MENTION_EVERYONE', 'USE_EXTERNAL_EMOJIS', 'MANAGE_ROLES', 'MANAGE_WEBHOOKS'] },
				{ id: modRole.id, allowed: ['VIEW_CHANNEL', 'READ_MESSAGE_HISTORY'] }],
			reason: `${this.client.user.username} initialization: Adjusting Log Channel Permissions`
		});

		// Specific Setup for the Command and Control Server
		if (type === 'control') {
			const globalLogChannel = await this.channels.create('global-log', {
				type: 'text',
				topic: `Global activity log for ${this.client.user.username}`,
				reason: `${this.client.user.username} initialization: Global Log Channel`
			});

			await globalLogChannel.overwritePermissions({
				overwrites: [
					// eslint-disable-next-line max-len
					{ id: this.client.user.id, allowed: ['CREATE_INSTANT_INVITE', 'MANAGE_CHANNELS', 'ADD_REACTIONS', 'VIEW_CHANNEL', 'SEND_MESSAGES', 'SEND_TTS_MESSAGES', 'MANAGE_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES', 'READ_MESSAGE_HISTORY', 'MENTION_EVERYONE', 'USE_EXTERNAL_EMOJIS', 'MANAGE_ROLES', 'MANAGE_WEBHOOKS'] },
					// eslint-disable-next-line max-len
					{ id: this.defaultRole.id, denied: ['CREATE_INSTANT_INVITE', 'MANAGE_CHANNELS', 'ADD_REACTIONS', 'VIEW_CHANNEL', 'SEND_MESSAGES', 'SEND_TTS_MESSAGES', 'MANAGE_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES', 'READ_MESSAGE_HISTORY', 'MENTION_EVERYONE', 'USE_EXTERNAL_EMOJIS', 'MANAGE_ROLES', 'MANAGE_WEBHOOKS'] },
					// eslint-disable-next-line max-len
					{ id: adminRole.id, allowed: ['CREATE_INSTANT_INVITE', 'MANAGE_CHANNELS', 'ADD_REACTIONS', 'VIEW_CHANNEL', 'SEND_MESSAGES', 'SEND_TTS_MESSAGES', 'MANAGE_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES', 'READ_MESSAGE_HISTORY', 'MENTION_EVERYONE', 'USE_EXTERNAL_EMOJIS', 'MANAGE_ROLES', 'MANAGE_WEBHOOKS'] },
					{ id: modRole.id, allowed: ['VIEW_CHANNEL', 'READ_MESSAGE_HISTORY'] }],
				reason: `${this.client.user.username} initialization: Adjusting Global Log Channel Permissions`
			});

			// Setting Control Guild and Global Log Channel in clientStorage
			await this.client.configs.update({ guilds: { controlGuild: this.id } }, this);
			await this.client.configs.update({ channels: { globalLog: globalLogChannel.id } }, this);

			// Adding and initializing the affirmative and negative emojis for the bot to use
			const affirmEmoji = await this.emojis.create('./src/assets/img/emoji/affirm.png', 'Affirm', { reason: `${this.client.user.username} initialization: Creating Affirm Emoji` });
			const rejectEmoji = await this.emojis.create('./src/assets/img/emoji/reject.png', 'Reject', { reason: `${this.client.user.username} initialization: Creating Reject Emoji` });
			await this.client.configs.update({ emoji: { affirm: affirmEmoji.id, reject: rejectEmoji.id } }, this);
			await this.client.configs.sync(true);
		}

		await this.client.emit('verbose', `Initialized Guild: ${this.name} (${this.id})`);

		// Informing Guild Owner of bot initialization
		await this.owner.send(`**${this.client.user.username}** has been initialized on **${this.name} Discord**!\nUse \`${this.configs.prefix}help\` to see a list of commands!`);

		return;
	}

};
