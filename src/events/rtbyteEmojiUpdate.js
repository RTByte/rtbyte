const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'emojiUpdate' });
	}

	async run(oldEmoji, emoji) {
		if (!emoji.guild) return;

		let executor;
		if (emoji.guild.me.hasPermission('VIEW_AUDIT_LOG')) {
			const auditLog = await emoji.guild.fetchAuditLogs();
			const logEntry = await auditLog.entries.first();

			if (logEntry.action === 'EMOJI_UPDATE') executor = logEntry ? logEntry.executor : undefined;
		}

		if (emoji.guild.settings.get('channels.log') && emoji.guild.settings.get('logs.events.emojiCreate')) await this.serverLog(oldEmoji, emoji, executor);

		return;
	}

	async serverLog(oldEmoji, emoji, executor) {
		const arrowRightEmoji = this.client.emojis.cache.get(this.client.settings.get('emoji.arrowRight'));

		const embed = new MessageEmbed()
			.setAuthor(`:${emoji.name}:`, `https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? 'gif' : 'png'}`)
			.setColor(this.client.settings.get('colors.blue'))
			.addField(emoji.guild.language.get('NAME_CHANGED'), `${oldEmoji.name} ${arrowRightEmoji} ${emoji.name}`)
			.setTimestamp()
			.setFooter(emoji.guild.language.get('GUILD_LOG_EMOJIUPDATE', executor), executor ? executor.displayAvatarURL() : undefined);

		const logChannel = await this.client.channels.cache.get(emoji.guild.settings.get('channels.log'));
		if (logChannel) await logChannel.send('', { disableEveryone: true, embed: embed });

		return;
	}

};
