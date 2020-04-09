const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'emojiCreate' });
	}

	async run(emoji) {
		if (!emoji.guild) return;

		let auditLog, logEntry;
		if (emoji.guild.me.hasPermission('VIEW_AUDIT_LOG')) {
			auditLog = await emoji.guild.fetchAuditLogs();
			logEntry = await auditLog.entries.first();
		}

		if (emoji.guild.settings.get('channels.log') && emoji.guild.settings.get('logs.events.emojiCreate')) await this.serverLog(emoji, logEntry);

		return;
	}

	async serverLog(emoji, logEntry) {
		const executor = logEntry ? logEntry.executor : undefined;

		const embed = new MessageEmbed()
			.setAuthor(`:${emoji.name}:`, `https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? 'gif' : 'png'}`)
			.setColor(this.client.settings.get('colors.green'))
			.setTimestamp()
			.setFooter(emoji.guild.language.get('GUILD_LOG_EMOJICREATE', executor), executor ? executor.displayAvatarURL() : undefined);

		if (emoji.guild.settings.get('logs.verboseLogging')) embed.addField(emoji.guild.language.get('ID'), emoji.id, true);

		const logChannel = await this.client.channels.get(emoji.guild.settings.get('channels.log'));
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

};
