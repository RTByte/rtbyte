const { Extendable, KlasaGuild } = require('klasa');

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, { appliesTo: [KlasaGuild] });
	}

	async rtbyteInit(type = null) {
		if (!this.available) return;

		await this.client.emit('verbose', `Initializing guild: ${this.name} (${this.id})`);

		// Creating necessary roles on new guild
		const adminRole = await this.roles.create({ data: { name: 'Admin' }, reason: `${this.client.user.username} initialization: Admin role` });
		const modRole = await this.roles.create({ data: { name: 'Moderator' }, reason: `${this.client.user.username} initialization: Moderator role` });

		await this.settings.update('roles.administrator', adminRole, this);
		await this.settings.update('roles.moderator', modRole, this);

		await this.settings.sync(true);

		// Creating log channel
		const logChannel = await this.channels.create('server-log', {
			topic: `Activity log for ${this.client.user.username}`,
			reason: `${this.client.user.username} initialization: Log channel`
		});

		// Adding log channel into guild settings
		await this.settings.update('channels.log', logChannel, this);

		// Giving the guild owner the rank of Administrator
		await this.owner.roles.add(adminRole, `${this.client.user.username} initialization: Granting guild owner admin status`);

		// Removing respective permissions for server log channels
		await logChannel.updateOverwrite(this.client.user, {
			VIEW_CHANNEL: true,
			READ_MESSAGE_HISTORY: true
		},
		`${this.client.user.username} initialization: Adjusting log channel permissions for bot`);
		await logChannel.updateOverwrite(this.defaultRole, {
			VIEW_CHANNEL: false,
			READ_MESSAGE_HISTORY: false
		},
		`${this.client.user.username} initialization: Adjusting log channel permissions for @everyone`);
		await logChannel.updateOverwrite(adminRole, {
			VIEW_CHANNEL: true,
			READ_MESSAGE_HISTORY: true
		},
		`${this.client.user.username} initialization: Adjusting log channel permissions for administrator role`);
		await logChannel.updateOverwrite(modRole, {
			VIEW_CHANNEL: true,
			READ_MESSAGE_HISTORY: true
		},
		`${this.client.user.username} initialization: Adjusting log channel permissions for moderator role`);

		if (type === 'control') {
			const globalLogChannel = await this.channels.create('global-log', {
				topic: `Global activity log for ${this.client.user.username}`,
				reason: `${this.client.user.username} initialization: Global log channel`
			});

			await globalLogChannel.updateOverwrite(this.client.user, {
				VIEW_CHANNEL: true,
				READ_MESSAGE_HISTORY: true
			},
			`${this.client.user.username} initialization: Adjusting log channel permissions for bot`);
			await globalLogChannel.updateOverwrite(this.defaultRole, {
				VIEW_CHANNEL: false,
				READ_MESSAGE_HISTORY: false
			},
			`${this.client.user.username} initialization: Adjusting log channel permissions for @everyone`);
			await globalLogChannel.updateOverwrite(adminRole, {
				VIEW_CHANNEL: true,
				READ_MESSAGE_HISTORY: true
			},
			`${this.client.user.username} initialization: Adjusting log channel permissions for administrator role`);
			await globalLogChannel.updateOverwrite(modRole, {
				VIEW_CHANNEL: true,
				READ_MESSAGE_HISTORY: true
			},
			`${this.client.user.username} initialization: Adjusting log channel permissions for moderator role`);

			// Setting control guild and global log channel in clientStorage
			await this.client.settings.update('guilds.controlGuild', this.id, this);
			await this.client.settings.update('channels.globalLog', globalLogChannel.id, this);

			// Adding and initializing the emojis for the bot to use
			const affirmEmoji = await this.emojis.create('./src/assets/img/emoji/affirm.png', 'affirm', { reason: `${this.client.user.username} initialization: Creating affirm emoji` });
			const rejectEmoji = await this.emojis.create('./src/assets/img/emoji/reject.png', 'reject', { reason: `${this.client.user.username} initialization: Creating reject emoji` });
			const arrowLeftEmoji = await this.emojis.create('./src/assets/img/emoji/arrowLeft.png', 'arrow_left', { reason: `${this.client.user.username} initialization: Creating arrowLeft emoji` });
			const arrowToLeftEmoji = await this.emojis.create('./src/assets/img/emoji/arrowToLeft.png', 'arrow_to_left', { reason: `${this.client.user.username} initialization: Creating arrowToLeft emoji` });
			const arrowRightEmoji = await this.emojis.create('./src/assets/img/emoji/arrowRight.png', 'arrow_right', { reason: `${this.client.user.username} initialization: Creating arrowRight emoji` });
			const arrowToRightEmoji = await this.emojis.create('./src/assets/img/emoji/arrowToRight.png', 'arrow_to_right', { reason: `${this.client.user.username} initialization: Creating arrowToRight emoji` });
			const infoEmoji = await this.emojis.create('./src/assets/img/emoji/info.png', 'info', { reason: `${this.client.user.username} initialization: Creating info emoji` });
			const listEmoji = await this.emojis.create('./src/assets/img/emoji/list.png', 'list', { reason: `${this.client.user.username} initialization: Creating list emoji` });
			const onlineEmoji = await this.emojis.create('./src/assets/img/emoji/online.png', 'online', { reason: `${this.client.user.username} initialization: Creating online emoji` });
			const idleEmoji = await this.emojis.create('./src/assets/img/emoji/idle.png', 'idle', { reason: `${this.client.user.username} initialization: Creating idle emoji` });
			const dndEmoji = await this.emojis.create('./src/assets/img/emoji/dnd.png', 'dnd', { reason: `${this.client.user.username} initialization: Creating dnd emoji` });
			const offlineEmoji = await this.emojis.create('./src/assets/img/emoji/offline.png', 'offline', { reason: `${this.client.user.username} initialization: Creating offline emoji` });
			await this.client.settings.update('emoji.affirm', affirmEmoji.id, this);
			await this.client.settings.update('emoji.reject', rejectEmoji.id, this);
			await this.client.settings.update('emoji.arrowLeft', arrowLeftEmoji.id, this);
			await this.client.settings.update('emoji.arrowToLeft', arrowToLeftEmoji.id, this);
			await this.client.settings.update('emoji.arrowRight', arrowRightEmoji.id, this);
			await this.client.settings.update('emoji.arrowToRight', arrowToRightEmoji.id, this);
			await this.client.settings.update('emoji.info', infoEmoji.id, this);
			await this.client.settings.update('emoji.list', listEmoji.id, this);
			await this.client.settings.update('emoji.online', onlineEmoji.id, this);
			await this.client.settings.update('emoji.idle', idleEmoji.id, this);
			await this.client.settings.update('emoji.dnd', dndEmoji.id, this);
			await this.client.settings.update('emoji.offline', offlineEmoji.id, this);
			await this.client.settings.sync(true);
		}

		await this.client.emit('verbose', `Initialized guild: ${this.name} (${this.id})`);

		// Informing guild owner of bot initialization
		await this.owner.send(`**${this.client.user.username}** has been initialized on the **${this.name}** Discord!\nUse \`${this.settings.prefix}help\` to see a list of commands.\n\nJoin the RTByte support server:\nhttps://discord.gg/eRauWP4`);

		return;
	}

};
