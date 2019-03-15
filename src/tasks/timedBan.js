const { Task } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Task {

	async run({ guildID, userID, userTag }) {
		const guild = this.client.guilds.get(guildID);
		if (!guild) return;

		const bans = await guild.fetchBans();
		if (!bans.has(userID)) return;

		await guild.members.unban(userID);

		if (guild.settings.logs.events.guildMemberBanRemove) await this.unBanLog(guild, userID, userTag);
	}

	async unBanLog(guild, userID, userTag) {
		const embed = new MessageEmbed()
			.setColor(this.client.settings.colors.yellow)
			.setTimestamp()
			.setFooter(guild.language.get('GUILD_LOG_GUILDMEMBERBANREMOVE'));

		let user = {};

		if (this.client.users.has(userID)) user = this.client.users.get(userID);

		embed.setAuthor(`${user.tag ? user.tag : userTag} (${user.id ? user.id : userID})`, user.id ? user.displayAvatarURL() : null);

		// eslint-disable-next-line max-len
		if (guild.settings.moderation.notifyUser && user.id) await user.send(guild.language.get('MONITOR_MODERATION_AUTO_BOILERPLATE', guild), { disableEveryone: true, embed: embed });
		return;
	}

};
