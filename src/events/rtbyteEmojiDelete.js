const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'emojiDelete' });
	}

	async run(emoji) {
		if (!emoji.guild) return;

		let executor;
		if (emoji.guild.me.hasPermission('VIEW_AUDIT_LOG')) {
			const auditLog = await emoji.guild.fetchAuditLogs();
			const logEntry = await auditLog.entries.first();

			if (logEntry.action === 'EMOJI_DELETE') executor = logEntry ? logEntry.executor : undefined;
		}

		if (emoji.guild.settings.get('channels.log') && emoji.guild.settings.get('logs.events.emojiDelete')) await this.serverLog(emoji, executor);

		return;
	}

	async serverLog(emoji, executor) {
		const embed = new MessageEmbed()
			.setAuthor(`:${emoji.name}:`, `https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? 'gif' : 'png'}`)
			.setColor(this.client.settings.get('colors.red'))
			.setTimestamp()
			.setFooter(emoji.guild.language.get('GUILD_LOG_EMOJIDELETE', executor), executor ? executor.displayAvatarURL() : undefined);

		const logChannel = await this.client.channels.cache.get(emoji.guild.settings.get('channels.log'));
		if (logChannel) await logChannel.send('', { disableEveryone: true, embed: embed });

		return;
	}

};
