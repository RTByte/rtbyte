const { Event } = require('klasa');
const { ModCase } = require('../index');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'guildBanRemove' });
	}

	async run(guild, user) {
		if (!guild) return;

		let executor;
		if (guild.me.hasPermission('VIEW_AUDIT_LOG')) {
			const auditLog = await guild.fetchAuditLogs();
			const logEntry = await auditLog.entries.first();

			if (logEntry.action === 'MEMBER_BAN_REMOVE') executor = logEntry ? logEntry.executor : undefined;
		}

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
