const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'emojiDelete' });
	}

	async run(emoji) {
		if (!emoji.guild) return;

		if (emoji.guild.settings.get('channels.log') && emoji.guild.settings.get('logs.events.emojiDelete')) await this.emojiCreateLog(emoji);

		return;
	}

	async emojiCreateLog(emoji) {
		const embed = new MessageEmbed()
			.setAuthor(`:${emoji.name}:`, emoji.guild.iconURL())
			.setColor(this.client.settings.get('colors.red'))
			.setTimestamp()
			.setFooter(emoji.guild.language.get('GUILD_LOG_EMOJIDELETE'));

		if (emoji.guild.settings.get('logs.verboseLogging')) embed.addField(emoji.guild.language.get('ID'), emoji.id, true);
		const logChannel = await this.client.channels.get(emoji.guild.settings.get('channels.log'));
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

};
