const { Task } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Task {

	async run({ guildID, userID }) {
		const guild = this.client.guilds.get(guildID);
		if (!guild) return;
		const member = await guild.members.fetch(userID).catch(() => null);
		if (!member) return;
		const voiceBannedRole = await guild.roles.get(guild.settings.get('roles.voiceBanned'));
		if (!member.roles.has(guild.settings.get('roles.voiceBanned'))) return;

		await member.roles.remove(voiceBannedRole);

		if (guild.settings.get('logs.events.guildMemberVCUnBan')) await this.vcUnBanLog(guild, member);
	}

	async vcUnBanLog(guild, member) {
		const embed = new MessageEmbed()
			.setAuthor(`${member.user.tag} (${member.user.id})`, member.user.displayAvatarURL())
			.setColor(this.client.settings.get('colors.yellow'))
			.setTimestamp()
			.setFooter(guild.language.get('MODERATION_LOG_VCUNBAN'));

		const logChannel = await this.client.channels.get(guild.settings.get('channels.log'));
		await logChannel.send('', { disableEveryone: true, embed: embed });
		// eslint-disable-next-line max-len
		if (guild.settings.get('moderation.notifyUser')) await member.user.send(guild.language.get('MONITOR_MODERATION_AUTO_BOILERPLATE', guild), { disableEveryone: true, embed: embed });
		return;
	}

};
