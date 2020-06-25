const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');
const { momentThreshold, timezone } = require('../lib/util/Util');
const moment = require('moment-timezone');

momentThreshold(moment);

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'guildMemberAdd' });
	}

	async run(member) {
		if (!member.guild) return;

		if (member.guild.settings.get('channels.log') && member.guild.settings.get('logs.events.guildMemberAdd') && !member.user.bot) await this.serverLog(member);

		if (member.guild.settings.get('greetings.welcomeNewUsers')) this.client.emit('guildMemberWelcome', member);

		if (member.guild.me.hasPermission('VIEW_AUDIT_LOG')) {
			const auditLog = await member.guild.fetchAuditLogs();
			const logEntry = await auditLog.entries.first();

			const { executor } = logEntry;

			if (logEntry.action === 'BOT_ADD') this.client.emit('guildBotAdd', member, executor);
		}

		return;
	}

	async serverLog(member) {
		const embed = new MessageEmbed()
			.setAuthor(`${member.user.tag} (${member.id})`, member.user.displayAvatarURL())
			.setColor(this.client.settings.get('colors.green'))
			.addField(member.guild.language.get('REGISTERED'), timezone(member.user.createdTimestamp, member.guild))
			.setTimestamp()
			.setFooter(member.guild.language.get('GUILD_LOG_GUILDMEMBERADD'));

		const logChannel = await this.client.channels.get(member.guild.settings.get('channels.log'));
		if (logChannel) await logChannel.send('', { disableEveryone: true, embed: embed });

		return;
	}

};
