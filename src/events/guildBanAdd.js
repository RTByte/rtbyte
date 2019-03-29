const { Event } = require('klasa');
const Case = require('../lib/structures/Case');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'guildBanAdd' });
	}

	async run(guild, user) {
		const bans = await guild.fetchBans();
		const banInfo = await bans.get(user.id);

		// Ignore if ban was initiated by command
		if (banInfo.reason.includes('(fc)', banInfo.reason.length - 4)) return;

		const modCase = new Case(guild)
			.setType('ban')
			.setUser(user)
			.setReason(banInfo.reason);
		await modCase.submit();

		const embed = await modCase.embed();
		await embed.send();

		return;
	}

};
