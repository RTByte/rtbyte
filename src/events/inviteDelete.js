const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'inviteDelete' });
	}

	async run(invite) {
		if (!invite.guild) return;

		let executor, uses;
		if (invite.guild.me.hasPermission('VIEW_AUDIT_LOG')) {
			const auditLog = await invite.guild.fetchAuditLogs();
			const logEntry = await auditLog.entries.first();

			if (logEntry.action === 'INVITE_DELETE') {
				uses = logEntry ? logEntry.changes[3].old : 0;
				executor = logEntry ? logEntry.executor : undefined;
			}
		}

		if (invite.guild.settings.get('channels.log') && invite.guild.settings.get('logs.events.inviteDelete')) await this.serverLog(invite, uses, executor);

		return;
	}

	async serverLog(invite, uses, executor) {
		const embed = new MessageEmbed()
			.setAuthor(`discord.gg/${invite.code}`, invite.guild.iconURL())
			.setDescription(invite.url)
			.setColor(this.client.settings.get('colors.red'))
			.addField(invite.channel.type === 'text' ? invite.guild.language.get('CHANNEL') : invite.guild.language.get('VOICE_CHANNEL'),
				invite.channel.type === 'text' ? invite.channel : `${invite.channel.name}`, true)
			.setTimestamp()
			.setFooter(invite.guild.language.get('GUILD_LOG_INVITEDELETE', executor), executor ? executor.displayAvatarURL() : undefined);

		if (uses > 0) await embed.addField(invite.guild.language.get('GUILD_LOG_INVITEDELETE_USES'), uses, true);

		const logChannel = await this.client.channels.get(invite.guild.settings.get('channels.log'));
		if (logChannel) await logChannel.send('', { disableEveryone: true, embed: embed });

		return;
	}

};
