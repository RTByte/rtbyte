const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');
const { Emojis } = require('../lib/util/constants');
const { Colors } = require('../lib/util/constants');
const { momentThreshold, timezone } = require('../lib/util/util');
const moment = require('moment-timezone');

momentThreshold(moment);

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'guildMemberRemove'	});
	}

	async run(member) {
		if (!member.guild) return;

		if (member.guild.available && member.guild.settings.get('channels.log') && member.guild.settings.get('logs.events.guildMemberRemove')) await this.serverLog(member);

		if (member.guild.available && member.guild.settings.get('greetings.dismissUsers')) this.client.emit('guildMemberDismiss', member);

		if (member.guild.me.hasPermission('VIEW_AUDIT_LOG')) {
			const auditLog = await member.guild.fetchAuditLogs();
			const logEntry = await auditLog.entries.first();

			const { reason, executor } = logEntry;

			if (logEntry.action === 'MEMBER_KICK') this.client.emit('guildMemberKick', member, reason, executor);
		}

		return;
	}

	async serverLog(member) {
		const botBadgeEmoji = this.client.emojis.cache.get(Emojis.botBadge);

		const embed = new MessageEmbed()
			.setAuthor(`${member.user.tag} (${member.id})`, member.user.displayAvatarURL())
			.setColor(Colors.red)
			.addField(member.guild.language.get('JOINED'), timezone(member.joinedTimestamp, member.guild))
			.setTimestamp()
			.setFooter(member.guild.language.get('GUILD_LOG_GUILDMEMBERREMOVE', member));

		if (member.user.bot) embed.setDescription(botBadgeEmoji);

		const logChannel = await this.client.channels.cache.get(member.guild.settings.get('channels.log'));
		if (logChannel) await logChannel.send('', { embed: embed });

		return;
	}

};
