const { Task } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Task {

	async run({ guildID, userID, userTag }) {
		const guild = this.client.guilds.get(guildID);
		if (!guild) return;

		const bans = await guild.fetchBans();
		if (!bans.has(userID)) return;

		await guild.members.unban(userID);
	}

};
