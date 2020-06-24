const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'webhookDelete' });
	}

	async run(channel, executor, webhook) {
		if (!channel.guild) return;

		if (channel.guild.settings.get('channels.log') && channel.guild.settings.get('logs.events.webhookDelete')) await this.serverLog(channel, executor, webhook);

		return;
	}

	async serverLog(channel, executor, webhook) {
		const embed = new MessageEmbed()
			.setAuthor(webhook.name, webhook.avatar)
			.setColor(this.client.settings.get('colors.red'))
			.addField(channel.guild.language.get('CHANNEL'), webhook.channel)
			.setTimestamp()
			.setFooter(channel.guild.language.get('GUILD_LOG_WEBHOOKDELETE', executor), executor ? executor.displayAvatarURL() : undefined);

		const logChannel = await this.client.channels.get(channel.guild.settings.get('channels.log'));
		if (logChannel) await logChannel.send('', { disableEveryone: true, embed: embed });

		return;
	}

};
