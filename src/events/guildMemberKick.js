const { Event } = require('klasa');
const { ModCase } = require('../index');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'guildMemberKick' });
	}

	async run(member, reason, executor) {
		if (!member.guild) return;

		// Ignore if kick was initiated by command
		if (reason && reason.endsWith('(fc)')) return;

		const modCase = new ModCase(member.guild)
			.setType('kick')
			.setUser(member.user)
			.setReason(reason)
			.setModerator(executor);
		await modCase.submit();

		const embed = await modCase.embed();
		await embed.send();
	}

};
