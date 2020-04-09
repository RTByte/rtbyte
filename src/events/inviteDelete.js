const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'inviteDelete' });
	}

	async run(invite) {
		let auditLog, logEntry;
		if (invite.guild.me.hasPermission('VIEW_AUDIT_LOG')) {
			auditLog = await invite.guild.fetchAuditLogs();
			logEntry = await auditLog.entries.first();
		}

		if (invite.guild.available && invite.guild.settings.get('channels.log') && invite.guild.settings.get('logs.events.inviteDelete')) await this.inviteDeleteLog(invite, logEntry);

		return;
	}

	async inviteDeleteLog(invite, logEntry) {
		const executor = logEntry ? logEntry.executor : undefined;
		const uses = logEntry ? logEntry.changes[3].old : 0;


		const embed = new MessageEmbed()
			.setAuthor(`discord.gg/${invite.code}`, invite.guild.iconURL())
			.setDescription(invite.url)
			.setColor(this.client.settings.get('colors.red'))
			.addField(invite.channel.type === 'text' ? invite.guild.language.get('CHANNEL') : invite.guild.language.get('VOICE_CHANNEL'),
				invite.channel.type === 'text' ? invite.channel : `${invite.channel.name}`, true)
			.setTimestamp()
			.setFooter(invite.guild.language.get('GUILD_LOG_INVITEDELETE', executor), invite.guild.me.hasPermission('VIEW_AUDIT_LOG') ? executor.displayAvatarURL() : null);

		if (uses > 0) await embed.addField(invite.guild.language.get('GUILD_LOG_INVITEDELETE_USES'), uses, true);

		const logChannel = await this.client.channels.get(invite.guild.settings.get('channels.log'));
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

};
