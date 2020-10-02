const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'customCmdUpdate' });
	}

	async run(msg, autoresponseKeyword, autoresponseContent, oldContent) {
		if (!msg.guild) return;

		const executor = msg.author;
		if (msg.guild.settings.get('channels.log') && msg.guild.settings.get('logs.events.autoResponseUpdate')) await this.serverLog(msg, autoresponseKeyword, autoresponseContent, oldContent, executor);

		return;
	}

	async serverLog(msg, autoresponseKeyword, autoresponseContent, oldContent, executor) {
		const embed = new MessageEmbed()
			.setAuthor(autoresponseKeyword, msg.guild.iconURL())
			.setColor(this.client.settings.get('colors.blue'))
			.addField(msg.language.get('GUILD_LOG_BEFORE'), oldContent.content)
			.addField(msg.language.get('GUILD_LOG_AFTER'), autoresponseContent)
			.setTimestamp()
			.setFooter(msg.guild.language.get('GUILD_LOG_AUTORESPONSEUPDATE', executor), executor.displayAvatarURL());

		const logChannel = await this.client.channels.cache.get(msg.guild.settings.get('channels.log'));
		if (logChannel) await logChannel.send('', { embed: embed });

		return;
	}

};
