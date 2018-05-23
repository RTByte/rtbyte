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

		await this.configs.update({ roles: { administrator: adminRole, moderator: modRole } }, this);

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

		// Removing respective permissions for server log channel
		await logChannel.updateOverwrite(this.client.user, {
			CREATE_INSTANT_INVITE: true,
			MANAGE_CHANNELS: true,
			ADD_REACTIONS: true,
			VIEW_CHANNEL: true,
			SEND_MESSAGES: true,
			SEND_TTS_MESSAGES: true,
			MANAGE_MESSAGES: true,
			EMBED_LINKS: true,
			ATTACH_FILES: true,
			READ_MESSAGE_HISTORY: true,
			MENTION_EVERYONE: true,
			USE_EXTERNAL_EMOJIS: true,
			MANAGE_ROLES: true,
			MANAGE_WEBHOOKS: true
		},
		`${this.client.user.username} initialization: Adjusting Log Channel Permissions for bot`);
		await logChannel.updateOverwrite(this.defaultRole, {
			CREATE_INSTANT_INVITE: false,
			MANAGE_CHANNELS: false,
			ADD_REACTIONS: false,
			VIEW_CHANNEL: false,
			SEND_MESSAGES: false,
			SEND_TTS_MESSAGES: false,
			MANAGE_MESSAGES: false,
			EMBED_LINKS: false,
			ATTACH_FILES: false,
			READ_MESSAGE_HISTORY: false,
			MENTION_EVERYONE: false,
			USE_EXTERNAL_EMOJIS: false,
			MANAGE_ROLES: false,
			MANAGE_WEBHOOKS: false
		},
		`${this.client.user.username} initialization: Adjusting Log Channel Permissions for @everyone`);
		await logChannel.updateOverwrite(adminRole, {
			CREATE_INSTANT_INVITE: true,
			MANAGE_CHANNELS: true,
			ADD_REACTIONS: true,
			VIEW_CHANNEL: true,
			SEND_MESSAGES: true,
			SEND_TTS_MESSAGES: true,
			MANAGE_MESSAGES: true,
			EMBED_LINKS: true,
			ATTACH_FILES: true,
			READ_MESSAGE_HISTORY: true,
			MENTION_EVERYONE: true,
			USE_EXTERNAL_EMOJIS: true,
			MANAGE_ROLES: true,
			MANAGE_WEBHOOKS: true
		},
		`${this.client.user.username} initialization: Adjusting Log Channel Permissions for Administrator role`);
		await logChannel.updateOverwrite(modRole, {
			VIEW_CHANNEL: true,
			READ_MESSAGE_HISTORY: true
		},
		`${this.client.user.username} initialization: Adjusting Log Channel Permissions for Moderator role`);

		// Specific Setup for the Command and Control Server
		if (type === 'control') {
			const globalLogChannel = await this.channels.create('global-log', {
				type: 'text',
				topic: `Global activity log for ${this.client.user.username}`,
				reason: `${this.client.user.username} initialization: Global Log Channel`
			});

			await globalLogChannel.updateOverwrite(this.client.user, {
				CREATE_INSTANT_INVITE: true,
				MANAGE_CHANNELS: true,
				ADD_REACTIONS: true,
				VIEW_CHANNEL: true,
				SEND_MESSAGES: true,
				SEND_TTS_MESSAGES: true,
				MANAGE_MESSAGES: true,
				EMBED_LINKS: true,
				ATTACH_FILES: true,
				READ_MESSAGE_HISTORY: true,
				MENTION_EVERYONE: true,
				USE_EXTERNAL_EMOJIS: true,
				MANAGE_ROLES: true,
				MANAGE_WEBHOOKS: true
			},
			`${this.client.user.username} initialization: Adjusting Log Channel Permissions for bot`);
			await globalLogChannel.updateOverwrite(this.defaultRole, {
				CREATE_INSTANT_INVITE: false,
				MANAGE_CHANNELS: false,
				ADD_REACTIONS: false,
				VIEW_CHANNEL: false,
				SEND_MESSAGES: false,
				SEND_TTS_MESSAGES: false,
				MANAGE_MESSAGES: false,
				EMBED_LINKS: false,
				ATTACH_FILES: false,
				READ_MESSAGE_HISTORY: false,
				MENTION_EVERYONE: false,
				USE_EXTERNAL_EMOJIS: false,
				MANAGE_ROLES: false,
				MANAGE_WEBHOOKS: false
			},
			`${this.client.user.username} initialization: Adjusting Log Channel Permissions for @everyone`);
			await globalLogChannel.updateOverwrite(adminRole, {
				CREATE_INSTANT_INVITE: true,
				MANAGE_CHANNELS: true,
				ADD_REACTIONS: true,
				VIEW_CHANNEL: true,
				SEND_MESSAGES: true,
				SEND_TTS_MESSAGES: true,
				MANAGE_MESSAGES: true,
				EMBED_LINKS: true,
				ATTACH_FILES: true,
				READ_MESSAGE_HISTORY: true,
				MENTION_EVERYONE: true,
				USE_EXTERNAL_EMOJIS: true,
				MANAGE_ROLES: true,
				MANAGE_WEBHOOKS: true
			},
			`${this.client.user.username} initialization: Adjusting Log Channel Permissions for Administrator role`);
			await globalLogChannel.updateOverwrite(modRole, {
				VIEW_CHANNEL: true,
				READ_MESSAGE_HISTORY: true
			},
			`${this.client.user.username} initialization: Adjusting Log Channel Permissions for Moderator role`);

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
