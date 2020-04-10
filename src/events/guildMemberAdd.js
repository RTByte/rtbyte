const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');
const moment = require('moment-timezone');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'guildMemberAdd' });
	}

	async run(member) {
		if (!member.guild) return;

		const modHistory = await this.client.settings.get('moderation.cases').filter(modCase => modCase.user === member.id && modCase.guild === member.guild.id);
		for (const modCase of modHistory) {
			if (!member.settings.get('moderation.cases').includes(modCase.id)) {
				await member.settings.sync();
				await member.settings.update('moderation.cases', modCase.id, member.guild);
			}
		}

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
			.addField(member.guild.language.get('REGISTERED'), moment.tz(member.user.createdTimestamp, member.guild.settings.get('timezone')).format('Do MMMM YYYY, h:mmA zz'))
			.setTimestamp()
			.setFooter(member.guild.language.get('GUILD_LOG_GUILDMEMBERADD'));

		const logChannel = await this.client.channels.get(member.guild.settings.get('channels.log'));
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

};
