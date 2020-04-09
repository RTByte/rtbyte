const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'emojiUpdate' });
	}

	async run(oldEmoji, emoji) {
		if (!emoji.guild) return;

		let auditLog, logEntry;
		if (emoji.guild.me.hasPermission('VIEW_AUDIT_LOG')) {
			auditLog = await emoji.guild.fetchAuditLogs();
			logEntry = await auditLog.entries.first();
		}

		if (emoji.guild.settings.get('channels.log') && emoji.guild.settings.get('logs.events.emojiCreate')) await this.serverLog(oldEmoji, emoji, logEntry);


		return;
	}

	async serverLog(oldEmoji, emoji, logEntry) {
		const executor = logEntry ? logEntry.executor : undefined;
		const arrowRightEmoji = this.client.emojis.get(this.client.settings.get('emoji.arrowRight'));

		const embed = new MessageEmbed()
			.setAuthor(`:${emoji.name}:`, `https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? 'gif' : 'png'}`)
			.setColor(this.client.settings.get('colors.blue'))
			.addField(emoji.guild.language.get('NAME_CHANGED'), `${oldEmoji.name} ${arrowRightEmoji} ${emoji.name}`)
			.setTimestamp()
			.setFooter(emoji.guild.language.get('GUILD_LOG_EMOJIUPDATE', executor), executor ? executor.displayAvatarURL() : undefined);

		const logChannel = await this.client.channels.get(emoji.guild.settings.get('channels.log'));
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

};
