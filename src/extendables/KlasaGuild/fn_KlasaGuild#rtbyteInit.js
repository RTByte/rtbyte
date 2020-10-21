/* eslint-disable complexity */
const { Extendable, KlasaGuild } = require('klasa');
const { MessageEmbed } = require('discord.js');
const { Colors } = require('../../lib/util/constants');

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, { appliesTo: [KlasaGuild] });
	}

	async rtbyteInit(type = null) {
		let rolesSkipped, channelsSkipped;
		if (!this.available) return;
		const clientMember = await this.members.fetch(this.client.user.id).catch(() => null);

		this.client.emit('verbose', `Initializing guild: ${this.name} (${this.id})`);

		if (clientMember.hasPermission('MANAGE_ROLES')) {
			if (!this.settings.get('roles.administrator') && !this.settings.get('roles.moderator')) {
				// Creating necessary roles on new guild
				const adminRole = await this.roles.create({ data: { name: 'Admin' }, reason: `${this.client.user.username} initialization: admin role` });
				const modRole = await this.roles.create({ data: { name: 'Moderator' }, reason: `${this.client.user.username} initialization: moderator role` });

				await this.settings.update('roles.administrator', adminRole, this);
				await this.settings.update('roles.moderator', modRole, this);

				await this.settings.sync(true);
			}
		} else {
			rolesSkipped = true;
		}

		if (clientMember.hasPermission('MANAGE_CHANNELS')) {
			if (!this.settings.get('channels.log')) {
				const adminRole = await this.roles.cache.get(this.settings.get('roles.administrator'));
				const modRole = await this.roles.cache.get(this.settings.get('roles.moderator'));

				// Creating log channel
				const logChannel = await this.channels.create('server-log', {
					topic: `Activity log for ${this.client.user.username}.`,
					reason: `${this.client.user.username} initialization: log channel`
				});
				// Adding log channel into guild settings
				await this.settings.update('channels.log', logChannel, this);

				// Check if role setup failed and adjust perms if not
				if (!rolesSkipped) {
					// Removing respective permissions for server log channels
					await logChannel.updateOverwrite(this.client.user, {
						VIEW_CHANNEL: true,
						READ_MESSAGE_HISTORY: true
					}, `${this.client.user.username} initialization: adjusting log channel permissions for bot`);

					await logChannel.updateOverwrite(this.id, {
						VIEW_CHANNEL: false,
						READ_MESSAGE_HISTORY: false
					}, `${this.client.user.username} initialization: adjusting log channel permissions for @everyone`);

					await logChannel.updateOverwrite(adminRole, {
						VIEW_CHANNEL: true,
						READ_MESSAGE_HISTORY: true
					}, `${this.client.user.username} initialization: adjusting log channel permissions for administrator role`);

					await logChannel.updateOverwrite(modRole, {
						VIEW_CHANNEL: true,
						READ_MESSAGE_HISTORY: true
					}, `${this.client.user.username} initialization: adjusting log channel permissions for moderator role`);
				}

				if (type === 'control') {
					const globalLogChannel = await this.channels.create('global-log', {
						topic: `Global activity log for ${this.client.user.username}.`,
						reason: `${this.client.user.username} initialization: global log channel`
					});

					// Check if role setup failed and adjust perms if not
					if (!rolesSkipped) {
						await globalLogChannel.updateOverwrite(this.client.user, {
							VIEW_CHANNEL: true,
							READ_MESSAGE_HISTORY: true
						}, `${this.client.user.username} initialization: adjusting log channel permissions for bot`);

						await globalLogChannel.updateOverwrite(this.id, {
							VIEW_CHANNEL: false,
							READ_MESSAGE_HISTORY: false
						}, `${this.client.user.username} initialization: adjusting log channel permissions for @everyone`);

						await logChannel.updateOverwrite(adminRole, {
							VIEW_CHANNEL: true,
							READ_MESSAGE_HISTORY: true
						}, `${this.client.user.username} initialization: adjusting log channel permissions for administrator role`);

						await logChannel.updateOverwrite(modRole, {
							VIEW_CHANNEL: true,
							READ_MESSAGE_HISTORY: true
						}, `${this.client.user.username} initialization: adjusting log channel permissions for moderator role`);
					}

					// Setting control guild and global log channel in clientStorage
					await this.client.settings.update('guilds.controlGuild', this.id, this);
					await this.client.settings.update('channels.globalLog', globalLogChannel.id, this);

					await this.client.settings.sync(true);
				}
			}
		} else {
			channelsSkipped = true;
		}

		// Get owner member and log channel
		const owner = await this.client.users.fetch(this.ownerID);
		// Building server owner message embed
		const embed = new MessageEmbed()
			.setAuthor(this.language.get('INIT_TITLE'), this.client.user.displayAvatarURL())
			.setColor(Colors.white)
			.setImage('https://rtbyte.xyz/img/og-img.jpg')
			.setTimestamp();

		if (rolesSkipped && !channelsSkipped) {
			this.client.emit('verbose', `Partially initialized guild: ${this.name} (${this.id}) - role setup skipped, missing permissions`);
			// eslint-disable-next-line max-len
			embed.setDescription(this.language.get('INIT_PARTIAL_R', this));
			if (owner && !this.settings.get('initialization.ownerInformed')) {
				await owner.createDM().then((dm) => dm.send('', { embed: embed })).catch(err => err);
			}
			await this.settings.update('initialization.ownerInformed', true);

			return;
		} else if (channelsSkipped && !rolesSkipped) {
			this.client.emit('verbose', `Partially initialized guild: ${this.name} (${this.id}) - channel setup skipped, missing permissions`);
			// eslint-disable-next-line max-len
			embed.setDescription(this.language.get('INIT_PARTIAL_C', this));
			if (owner && !this.settings.get('initialization.ownerInformed')) {
				await owner.createDM().then((dm) => dm.send('', { embed: embed })).catch(err => err);
			}
			await this.settings.update('initialization.ownerInformed', true);

			return;
		} else if (rolesSkipped && channelsSkipped) {
			this.client.emit('verbose', `Partially initialized guild: ${this.name} (${this.id}) - channel and role setup skipped, missing permissions`);
			// eslint-disable-next-line max-len
			embed.setDescription(this.language.get('INIT_FAIL', this));
			if (owner && !this.settings.get('initialization.ownerInformed')) {
				await owner.createDM().then((dm) => dm.send('', { embed: embed })).catch(err => err);
			}
			await this.settings.update('initialization.ownerInformed', true);

			return;
		} else {
			this.client.emit('verbose', `Initialized guild: ${this.name} (${this.id})`);
			embed.setDescription(this.language.get('INIT_SUCCESS', this));

			await this.settings.update('initialization.serverInitialized', true);

			// eslint-disable-next-line max-len
			if (owner && !this.settings.get('initialization.ownerInformed')) {
				await owner.createDM().then((dm) => dm.send('', { embed: embed })).catch(err => err);
			}
			await this.settings.update('initialization.ownerInformed', true);

			return;
		}
	}

};
