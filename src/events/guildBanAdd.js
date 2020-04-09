const { Event } = require('klasa');
const { ModCase } = require('../index');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'guildBanAdd' });
	}

	async run(guild, user) {
		if (!guild) return;
		let auditLog, logEntry, bans, banInfo;

		if (guild.me.hasPermission('VIEW_AUDIT_LOG')) {
			auditLog = await guild.fetchAuditLogs();
			logEntry = await auditLog.entries.first();
		}
		if (guild.me.hasPermission('BAN_MEMBERS')) {
			bans = await guild.fetchBans();
			banInfo = await bans.get(user.id);
		}

		const executor = logEntry ? logEntry.executor : undefined;

		// Ignore if ban was initiated by command
		if (banInfo.reason && banInfo.reason.endsWith('(fc)')) return;

		const modCase = new ModCase(guild)
			.setType('ban')
			.setUser(user)
			.setReason(banInfo.reason);
		if (executor) modCase.setModerator(executor);
		await modCase.submit();

		const embed = await modCase.embed();
		await embed.send();

		return;
	}

};
