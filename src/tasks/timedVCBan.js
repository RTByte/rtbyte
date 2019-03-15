const { Task } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Task {

	async run({ guildID, userID }) {
		const guild = this.client.guilds.get(guildID);
		if (!guild) return;
		const member = await guild.members.fetch(userID).catch(() => null);
		if (!member) return;
		const voiceBannedRole = await guild.roles.get(guild.settings.roles.voiceBanned);
		if (!member.roles.has(guild.settings.roles.voiceBanned)) return;

		await member.roles.remove(voiceBannedRole);

		if (guild.settings.logs.events.guildMemberVCUnBan) await this.vcUnBanLog(guild, member);
	}

	async vcUnBanLog(guild, member) {
		const embed = new MessageEmbed()
			.setAuthor(`${member.user.tag} (${member.user.id})`, member.user.displayAvatarURL())
			.setColor(this.client.settings.colors.yellow)
			.setTimestamp()
			.setFooter(guild.language.get('GUILD_LOG_GUILDMEMBERVCUNBAN'));

		const logChannel = await this.client.channels.get(guild.settings.channels.log);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		// eslint-disable-next-line max-len
		if (guild.settings.moderation.notifyUser) await member.user.send(guild.language.get('MONITOR_MODERATION_AUTO_BOILERPLATE', guild), { disableEveryone: true, embed: embed });
		return;
	}

};
