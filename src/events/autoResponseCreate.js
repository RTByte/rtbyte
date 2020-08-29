const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'autoResponseCreate' });
	}

	async run(msg, autoResponseKeyword, autoResponseContent) {
		if (!msg.guild) return;

		const executor = msg.author;
		if (msg.guild.settings.get('channels.log') && msg.guild.settings.get('logs.events.autoResponseCreate')) await this.serverLog(msg, autoResponseKeyword, autoResponseContent, executor);

		return;
	}

	async serverLog(msg, autoResponseKeyword, autoResponseContent, executor) {
		const embed = new MessageEmbed()
			.setAuthor(autoResponseKeyword, msg.guild.iconURL())
			.setColor(this.client.settings.get('colors.green'))
			.addField(msg.language.get('GUILD_LOG_AUTORESPONSECREATE_RESPONSE'), autoResponseContent)
			.setTimestamp()
			.setFooter(msg.guild.language.get('GUILD_LOG_AUTORESPONSECREATE', executor), executor.displayAvatarURL());

		const logChannel = await this.client.channels.cache.get(msg.guild.settings.get('channels.log'));
		if (logChannel) await logChannel.send('', { embed: embed });

		return;
	}

};
