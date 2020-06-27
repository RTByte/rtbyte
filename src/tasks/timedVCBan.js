const { Task } = require('klasa');
const { ModCase } = require('../index');

module.exports = class extends Task {

	async run({ guildID, userID, modID }) {
		const guild = this.client.guilds.cache.get(guildID);
		if (!guild) return;
		const member = await guild.members.fetch(userID).catch(() => null);
		if (!member) return;
		const mod = await guild.members.fetch(modID).catch(() => null);
		if (!mod) return;
		const voiceBannedRole = await guild.roles.cache.get(guild.settings.roles.voiceBanned);
		if (!member.roles.cache.has(guild.settings.roles.voiceBanned)) return;

		await member.roles.remove(voiceBannedRole);

		const modCase = new ModCase(guild)
			.setUser(member.user)
			.setType('vcunban')
			.setModerator(mod.user);

		await modCase.submit();

		const embed = await modCase.embed();
		await embed.send();

		return;
	}

};
