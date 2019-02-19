const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'emojiDelete' });
	}

	async run(emoji) {
		if (!emoji.guild) return;
		if (emoji.guild.available && emoji.guild.settings.logs.events.emojiDelete) await this.emojiCreateLog(emoji);

		return;
	}

	async emojiCreateLog(emoji) {
		const embed = new MessageEmbed()
			.setAuthor(`:${emoji.name}:`, emoji.guild.iconURL())
			.setColor(this.client.settings.colors.red)
			.setTimestamp()
			.setFooter(emoji.guild.language.get('GUILD_LOG_EMOJIDELETE'));

		const logChannel = await this.client.channels.get(emoji.guild.settings.channels.log);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

};
