const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');
const { Colors } = require('../lib/util/constants');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'autoresponseCreate' });
	}

	async run(msg, autoresponseKeyword, autoresponseContent) {
		if (!msg.guild) return;

		const executor = msg.author;
		if (msg.guild.settings.get('channels.log') && msg.guild.settings.get('logs.events.autoresponseCreate')) await this.serverLog(msg, autoresponseKeyword, autoresponseContent, executor);

		return;
	}

	async serverLog(msg, autoresponseKeyword, autoresponseContent, executor) {
		const embed = new MessageEmbed()
			.setAuthor(autoresponseKeyword, msg.guild.iconURL())
			.setColor(Colors.green)
			.addField(msg.language.get('GUILD_LOG_AUTORESPONSECREATE_RESPONSE'), autoresponseContent)
			.setTimestamp()
			.setFooter(msg.guild.language.get('GUILD_LOG_AUTORESPONSECREATE', executor), executor.displayAvatarURL());

		const logChannel = await this.client.channels.cache.get(msg.guild.settings.get('channels.log'));
		if (logChannel) await logChannel.send('', { embed: embed });

		return;
	}

};
