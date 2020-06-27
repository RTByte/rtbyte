const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'channelCreate' });
	}

	async run(channel) {
		if (!channel.guild) return;

		let executor;
		if (channel.guild.me.hasPermission('VIEW_AUDIT_LOG')) {
			const auditLog = await channel.guild.fetchAuditLogs();
			const logEntry = await auditLog.entries.first();

			if (logEntry.action === 'CHANNEL_CREATE') executor = logEntry ? logEntry.executor : undefined;
		}

		if (channel.guild.settings.channels.log && channel.guild.settings.logs.events.channelCreate) await this.serverLog(channel, executor);

		return;
	}

	async serverLog(channel, executor) {
		const embed = new MessageEmbed()
			.setAuthor(`#${channel.name}`, channel.guild.iconURL())
			.setColor(this.client.settings.get('colors.green'))
			.addField(channel.guild.language.get('ID'), channel.id)
			.setTimestamp()
			.setFooter(channel.guild.language.get('GUILD_LOG_CHANNELCREATE', executor), executor ? executor.displayAvatarURL() : undefined);

		// Add category field if channel is in category
		if (channel.parent) {
			embed.addField(channel.guild.language.get('CATEGORY'), channel.parent);
		}

		// Change author and footer fields if channel is voice channel
		if (channel.type === 'voice') {
			embed.setAuthor(channel.name, channel.guild.iconURL());
			embed.setFooter(channel.guild.language.get('GUILD_LOG_CHANNELCREATE_VOICE', executor), executor ? executor.displayAvatarURL() : undefined);
		}

		// Change author and footer fields if channel is category
		if (channel.type === 'category') {
			embed.setAuthor(channel.name, channel.guild.iconURL());
			embed.setFooter(channel.guild.language.get('GUILD_LOG_CHANNELCREATE_CATEGORY', executor), executor ? executor.displayAvatarURL() : undefined);
		}

		// Change author and footer fields if channel is news channel
		if (channel.type === 'news') {
			embed.setFooter(channel.guild.language.get('GUILD_LOG_CHANNELCREATE_NEWS', executor), executor ? executor.displayAvatarURL() : undefined);
		}

		// Change author and footer fields if channel is store channel
		if (channel.type === 'store') {
			embed.setFooter(channel.guild.language.get('GUILD_LOG_CHANNELCREATE_STORE', executor), executor ? executor.displayAvatarURL() : undefined);
		}

		const logChannel = await this.client.channels.get(channel.guild.settings.get('channels.log'));
		if (logChannel) await logChannel.send('', { disableEveryone: true, embed: embed });

		return;
	}

};
