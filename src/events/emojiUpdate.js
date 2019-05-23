const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'emojiUpdate' });
	}

	async run(oldEmoji, emoji) {
		if (!emoji.guild) return;
		if (emoji.guild.available && emoji.guild.settings.logs.events.emojiCreate && !emoji.animated) await this.emojiCreateLog(oldEmoji, emoji);
		if (emoji.guild.available && emoji.guild.settings.logs.events.emojiCreate && emoji.animated) await this.animatedEmojiCreateLog(oldEmoji, emoji);

		return;
	}

	async emojiCreateLog(oldEmoji, emoji) {
		const arrowRightEmoji = this.client.emojis.get(this.client.settings.emoji.arrowRight);

		const embed = new MessageEmbed()
			.setAuthor(`:${emoji.name}:`, emoji.guild.iconURL())
			.setColor(this.client.settings.colors.blue)
			.addField(emoji.guild.language.get('NAME_CHANGED'), `\`${oldEmoji.name}\` ${arrowRightEmoji} \`${emoji.name}\``)
			.setTimestamp()
			.setFooter(emoji.guild.language.get('GUILD_LOG_EMOJIUPDATE'));

		const logChannel = await this.client.channels.get(emoji.guild.settings.channels.log);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

	async animatedEmojiCreateLog(oldEmoji, emoji) {
		const arrowRightEmoji = this.client.emojis.get(this.client.settings.emoji.arrowRight);

		const embed = new MessageEmbed()
			.setAuthor(`:${emoji.name}:`, emoji.guild.iconURL())
			.setColor(this.client.settings.colors.blue)
			.addField(emoji.guild.language.get('NAME_CHANGED'), `\`${oldEmoji.name}\` ${arrowRightEmoji} \`${emoji.name}\``)
			.setTimestamp()
			.setFooter(emoji.guild.language.get('GUILD_LOG_EMOJIUPDATE'));

		const logChannel = await this.client.channels.get(emoji.guild.settings.channels.log);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

};
