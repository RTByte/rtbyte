const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');
const { Colors } = require('../lib/util/constants');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'webhookCreate' });
	}

	async run(channel, executor, webhook) {
		if (!channel.guild) return;

		if (channel.guild.settings.get('channels.log') && channel.guild.settings.get('logs.events.webhookCreate')) await this.serverLog(channel, executor, webhook);

		return;
	}

	async serverLog(channel, executor, webhook) {
		const embed = new MessageEmbed()
			.setAuthor(webhook.name, webhook.avatar)
			.setColor(Colors.green)
			.addField(channel.guild.language.get('CHANNEL'), webhook.channel)
			.setTimestamp()
			.setFooter(channel.guild.language.get('GUILD_LOG_WEBHOOKCREATE', executor), executor ? executor.displayAvatarURL() : undefined);

		const logChannel = await this.client.channels.cache.get(channel.guild.settings.get('channels.log'));
		if (logChannel) await logChannel.send('', { embed: embed });

		return;
	}

};
