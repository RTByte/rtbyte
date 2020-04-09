const { Event } = require('klasa');
const { ModCase } = require('../index');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'guildBanRemove' });
	}

	async run(guild, user) {
		if (!guild) return;
		let auditLog, logEntry;

		if (guild.me.hasPermission('VIEW_AUDIT_LOG')) {
			auditLog = await guild.fetchAuditLogs();
			logEntry = await auditLog.entries.first();
		}

		const executor = logEntry ? logEntry.executor : undefined;

		const modCase = new ModCase(guild)
			.setType('unban')
			.setUser(user);
		if (executor) modCase.setModerator(executor);
		await modCase.submit();

		const embed = await modCase.embed();
		await embed.send();

		return;
	}

};
