const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'emojiCreate' });
	}

	async run(emoji) {
		if (!emoji.guild) return;
		if (emoji.guild.available && emoji.guild.settings.logs.events.emojiCreate && !emoji.animated) await this.emojiCreateLog(emoji);
		if (emoji.guild.available && emoji.guild.settings.logs.events.emojiCreate && emoji.animated) await this.animatedEmojiCreateLog(emoji);

		return;
	}

	async emojiCreateLog(emoji) {
		const embed = new MessageEmbed()
			.setAuthor(`:${emoji.name}:`, emoji.guild.iconURL())
			.setColor(this.client.settings.colors.green)
			.addField(emoji.guild.language.get('GUILD_LOG_EMOJI'), `<:${emoji.name}:${emoji.id}>`, true)
			.setTimestamp()
			.setFooter(emoji.guild.language.get('GUILD_LOG_EMOJICREATE'));

		if (emoji.guild.settings.logs.verboseLogging) {
			embed.addField(emoji.guild.language.get('ID'), emoji.id, true);
		}
		const logChannel = await this.client.channels.get(emoji.guild.settings.channels.log);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

	async animatedEmojiCreateLog(emoji) {
		const embed = new MessageEmbed()
			.setAuthor(`:${emoji.name}:`, emoji.guild.iconURL())
			.setColor(this.client.settings.colors.green)
			.addField(emoji.guild.language.get('GUILD_LOG_EMOJI'), `<a:${emoji.name}:${emoji.id}>`)
			.setTimestamp()
			.setFooter(emoji.guild.language.get('GUILD_LOG_EMOJICREATE'));

		if (emoji.guild.settings.logs.verboseLogging) embed.addField(emoji.guild.language.get('ID'), emoji.id, true);
		const logChannel = await this.client.channels.get(emoji.guild.settings.channels.log);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

};
