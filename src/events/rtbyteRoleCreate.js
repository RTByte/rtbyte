const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'roleCreate' });
	}

	async run(role) {
		if (!role.guild) return;

		let executor;
		if (role.guild.me.hasPermission('VIEW_AUDIT_LOG')) {
			const auditLog = await role.guild.fetchAuditLogs();
			const logEntry = await auditLog.entries.first();

			if (logEntry.action === 'ROLE_CREATE') executor = logEntry ? logEntry.executor : undefined;
		}

		if (role.guild.settings.channels.log && role.guild.settings.logs.events.roleCreate) await this.serverLog(role, executor);

		return;
	}

	async serverLog(role, executor) {
		const embed = new MessageEmbed()
			.setAuthor(`${role.name}`, role.guild.iconURL())
			.setColor(this.client.settings.get('colors.green'))
			.addField(role.guild.language.get('ID'), role.id)
			.addField(role.guild.language.get('GUILD_LOG_ROLECREATE_V_TAG'), role)
			.setTimestamp()
			.setFooter(role.guild.language.get('GUILD_LOG_ROLECREATE', executor), executor ? executor.displayAvatarURL() : undefined);

		const logChannel = await this.client.channels.get(role.guild.settings.get('channels.log'));
		if (logChannel) await logChannel.send('', { disableEveryone: true, embed: embed });

		return;
	}

};
