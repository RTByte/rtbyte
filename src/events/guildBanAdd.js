const { Event } = require('klasa');
const { ModCase } = require('../index');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'guildBanAdd' });
	}

	async run(guild, user) {
		const bans = await guild.fetchBans();
		const banInfo = await bans.get(user.id);

		// Ignore if ban was initiated by command
		if (banInfo.reason && banInfo.reason.endsWith('(fc)')) return;

		const modCase = new ModCase(guild)
			.setType('ban')
			.setUser(user)
			.setReason(banInfo.reason);
		await modCase.submit();

		const embed = await modCase.embed();
		await embed.send();

		return;
	}

};
