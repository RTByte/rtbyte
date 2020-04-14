const { Event } = require('klasa');
const { ModCase } = require('../index');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'guildBanAdd' });
	}

	async run(guild, user) {
		if (!guild) return;

		let executor, bans, banInfo;
		if (guild.me.hasPermission('VIEW_AUDIT_LOG')) {
			const auditLog = await guild.fetchAuditLogs();
			const logEntry = await auditLog.entries.first();

			if (logEntry.action === 'MEMBER_BAN_ADD') executor = logEntry ? logEntry.executor : undefined;
		}
		if (guild.me.hasPermission('BAN_MEMBERS')) {
			bans = await guild.fetchBans();
			banInfo = await bans.get(user.id);
		}

		// Ignore if ban was initiated by command
		if (banInfo && banInfo.reason ? banInfo.reason.endsWith('(fc)') : false) return;

		const modCase = new ModCase(guild)
			.setType('ban')
			.setUser(user)
			.setReason(banInfo && banInfo.reason ? banInfo.reason : guild.language.get('MODERATION_LOG_UNSPECIFIED'));
		if (executor) modCase.setModerator(executor);
		await modCase.submit();

		const embed = await modCase.embed();
		await embed.send();

		return;
	}

};
