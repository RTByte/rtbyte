const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'roleDelete' });
	}

	async run(role) {
		if (!role.guild) return;

		let executor;
		if (role.guild.me.hasPermission('VIEW_AUDIT_LOG')) {
			const auditLog = await role.guild.fetchAuditLogs();
			const logEntry = await auditLog.entries.first();

			if (logEntry.action === 'ROLE_DELETE') executor = logEntry ? logEntry.executor : undefined;
		}

		if (role.guild.settings.channels.log && role.guild.settings.logs.events.roleDelete) await this.serverLog(role, executor);

		// Config checks
		// Checks server and client configs to see if the deleted role has been configured anywhere. If it has, resets or removes it.
		if (role.id === role.guild.settings.get('roles.administrator')) await role.guild.settings.reset('roles.administrator');
		if (role.id === role.guild.settings.get('roles.moderator')) await role.guild.settings.reset('roles.moderator');
		if (role.id === role.guild.settings.get('roles.muted')) await role.guild.settings.reset('roles.muted');
		if (role.id === role.guild.settings.get('roles.voiceBanned')) await role.guild.settings.reset('roles.voiceBanned');
		if (role.id === role.guild.settings.get('twitch.twitchNotifsRole')) await role.guild.settings.reset('twitch.twitchNotifsRole');

		// Reset won't work for arrays of role IDs, and we can't use update() with a deleted role.
		if (role.guild.settings.get('roles.joinable').includes(role.id)) {
			// Capture old list of roles
			const oldList = role.guild.settings.get('roles.joinable');

			// Reset current list
			await role.guild.settings.reset('roles.joinable');

			// Declare new list without the deleted role and re-add the other ones
			const newList = oldList.filter(rl => rl !== role.id);
			for (let i = 0; i < newList.length; i++) {
				await role.guild.settings.sync();
				await role.guild.settings.update('roles.joinable', newList[i]);
			}
		}

		return;
	}

	async serverLog(role, executor) {
		const embed = new MessageEmbed()
			.setAuthor(`${role.name}`, role.guild.iconURL())
			.setColor(this.client.settings.get('colors.red'))
			.addField(role.guild.language.get('ID'), role.id, true)
			.setTimestamp()
			.setFooter(role.guild.language.get('GUILD_LOG_ROLEDELETE', executor), executor ? executor.displayAvatarURL() : undefined);

		const logChannel = await this.client.channels.get(role.guild.settings.get('channels.log'));
		if (logChannel) await logChannel.send('', { disableEveryone: true, embed: embed });

		return;
	}

};
