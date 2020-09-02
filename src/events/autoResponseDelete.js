const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'autoresponseDelete' });
	}

	async run(msg, autoresponseKeyword) {
		if (!msg.guild) return;

		const executor = msg.author;
		if (msg.guild.settings.get('channels.log') && msg.guild.settings.get('logs.events.autoresponseCreate')) await this.serverLog(msg, autoresponseKeyword, executor);

		return;
	}

	async serverLog(msg, autoresponseKeyword, executor) {
		const embed = new MessageEmbed()
			.setAuthor(autoresponseKeyword, msg.guild.iconURL())
			.setColor(this.client.settings.get('colors.red'))
			.setTimestamp()
			.setFooter(msg.guild.language.get('GUILD_LOG_AUTORESPONSEDELETE', executor), executor.displayAvatarURL());

		const logChannel = await this.client.channels.cache.get(msg.guild.settings.get('channels.log'));
		if (logChannel) await logChannel.send('', { embed: embed });

		return;
	}

};
