const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'roleCreate' });
	}

	async run(role) {
		if (!role.guild) return;

		let auditLog, logEntry;
		if (role.guild.me.hasPermission('VIEW_AUDIT_LOG')) {
			auditLog = await role.guild.fetchAuditLogs();
			logEntry = await auditLog.entries.first();
		}

		if (role.guild.settings.get('channels.log') && role.guild.settings.get('logs.events.roleCreate')) await this.serverLog(role, logEntry);

		return;
	}

	async serverLog(role, logEntry) {
		const executor = logEntry ? logEntry.executor : undefined;

		const embed = new MessageEmbed()
			.setAuthor(`${role.name}`, role.guild.iconURL())
			.setColor(this.client.settings.get('colors.green'))
			.setTimestamp()
			.setFooter(role.guild.language.get('GUILD_LOG_ROLECREATE', executor), executor ? executor.displayAvatarURL() : undefined);

		if (role.guild.settings.get('logs.verboseLogging')) {
			embed.addField(role.guild.language.get('ID'), role.id);
			embed.addField(role.guild.language.get('GUILD_LOG_ROLECREATE_V_TAG'), role);
		}

		const logChannel = await this.client.channels.get(role.guild.settings.get('channels.log'));
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

};
