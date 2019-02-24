const { Task } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Task {

	async run({ guild, user }) {
		const _guild = this.client.guilds.get(guild);
		if (!_guild) return;
		const member = await _guild.members.fetch(user).catch(() => null);
		if (!member) return;
		const mutedRole = await _guild.roles.get(_guild.settings.roles.muted);
		await member.roles.remove(mutedRole);

		if (_guild.settings.logs.events.guildMemberUnmute) await this.unmuteLog(_guild, member);
	}

	async unmuteLog(_guild, member) {
		const embed = new MessageEmbed()
			.setAuthor(`${member.user.tag} (${member.user.id})`, member.user.displayAvatarURL())
			.setColor(this.client.settings.colors.yellow)
			.setTimestamp()
			.setFooter(_guild.language.get('GUILD_LOG_GUILDMEMBERUNMUTE'));

		const logChannel = await this.client.channels.get(_guild.settings.channels.log);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		// eslint-disable-next-line max-len
		if (_guild.settings.moderation.notifyUser) await member.user.send(_guild.language.get('MONITOR_MODERATION_AUTO_BOILERPLATE', _guild), { disableEveryone: true, embed: embed });
		return;
	}

};
