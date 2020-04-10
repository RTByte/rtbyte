const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');
const moment = require('moment-timezone');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'guildMemberAdd' });
	}

	async run(member) {
		if (!member.guild) return;

		const modHistory = await this.client.settings.moderation.cases.filter(modCase => modCase.user === member.id && modCase.guild === member.guild.id);
		for (const modCase of modHistory) {
			if (!member.settings.moderation.cases.includes(modCase.id)) {
				await member.settings.sync();
				await member.settings.update('moderation.cases', modCase.id, member.guild);
			}
		}

		if (member.guild.settings.channels.log && member.guild.settings.logs.events.guildMemberAdd && !member.user.bot) await this.serverLog(member);

		if (member.guild.settings.greetings.welcomeNewUsers) this.client.emit('guildMemberWelcome', member);

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
			.setColor(this.client.settings.colors.green)
			.setTimestamp()
			.setFooter(member.guild.language.get('GUILD_LOG_GUILDMEMBERADD'));

		const { verboseLogging } = member.guild.settings.logs;
		if (verboseLogging) await embed.addField(member.guild.language.get('REGISTERED'), moment.tz(member.user.createdTimestamp, member.guild.settings.timezone).format('Do MMMM YYYY, h:mmA zz'));

		const logChannel = await this.client.channels.get(member.guild.settings.channels.log);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

};
