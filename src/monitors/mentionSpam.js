const { Monitor } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Monitor {

	constructor(...args) {
		super(...args, {
			ignoreSelf: true,
			ignoreOthers: false,
			ignoreEdits: false
		});
	}

	async run(msg) {
		if (!msg.guild.settings.filters.mentionSpamEnabled) return;
		if (msg.guild.settings.filters.modBypass && msg.member.roles.has(msg.guild.settings.roles.moderator)) return;

		const member = await msg.guild.members.fetch(msg.author);
		const mentions = msg.mentions.users.size + msg.mentions.roles.size;

		if (mentions > msg.guild.settings.filters.mentionSpamThreshold) {
			if (msg.guild.settings.logs.events.mentionSpam) await this.mentionSpamLog(member);
			if (msg.guild.settings.filters.delete) await msg.delete();
			await msg.guild.members.ban(member, { days: 1, reason: msg.guild.language.get('GUILD_LOG_MENTIONSPAM') });
		}

		return;
	}

	async mentionSpamLog(member) {
		const embed = new MessageEmbed()
			.setAuthor(`${member.user.tag} (${member.user.id})`, member.user.displayAvatarURL())
			.setColor(this.client.settings.colors.red)
			.setTimestamp()
			.setFooter(member.guild.language.get('GUILD_LOG_MENTIONSPAM'));

		const logChannel = await this.client.channels.get(member.guild.settings.channels.log);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		// eslint-disable-next-line max-len
		if (member.guild.settings.moderation.notifyUser) await member.send(member.guild.language.get('MONITOR_MODERATION_AUTO_BOILERPLATE', member.guild), { disableEveryone: true, embed: embed });
		return;
	}

};
