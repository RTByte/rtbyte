const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'channelDelete' });
	}

	async run(channel) {
		if (!channel.guild) return;

		let executor;
		if (channel.guild.me.hasPermission('VIEW_AUDIT_LOG')) {
			const auditLog = await channel.guild.fetchAuditLogs();
			const logEntry = await auditLog.entries.first();

			if (logEntry.action === 'CHANNEL_DELETE') executor = logEntry ? logEntry.executor : undefined;
		}

		if (channel.guild.settings.get('channels.log') && channel.guild.settings.get('logs.events.channelDelete')) await this.serverLog(channel, executor);

		return;
	}

	async serverLog(channel, executor) {
		const embed = new MessageEmbed()
			.setAuthor(`#${channel.name}`, channel.guild.iconURL())
			.setColor(this.client.settings.get('colors.red'))
			.setTimestamp()
			.setFooter(channel.guild.language.get('GUILD_LOG_CHANNELDELETE', executor), executor ? executor.displayAvatarURL() : undefined);

		// Change author and footer fields if channel is voice channel
		if (channel.type === 'voice') {
			embed.setAuthor(channel.name, channel.guild.iconURL());
			embed.setFooter(channel.guild.language.get('GUILD_LOG_CHANNELDELETE_VOICE', executor), executor ? executor.displayAvatarURL() : undefined);
		}

		// Change author and footer fields if channel is category
		if (channel.type === 'category') {
			embed.setAuthor(channel.name, channel.guild.iconURL());
			embed.setFooter(channel.guild.language.get('GUILD_LOG_CHANNELDELETE_CATEGORY', executor), executor ? executor.displayAvatarURL() : undefined);
		}

		// Change author and footer fields if channel is news channel
		if (channel.type === 'news') {
			embed.setFooter(channel.guild.language.get('GUILD_LOG_CHANNELDELETE_NEWS', executor), executor ? executor.displayAvatarURL() : undefined);
		}

		// Change author and footer fields if channel is store channel
		if (channel.type === 'store') {
			embed.setFooter(channel.guild.language.get('GUILD_LOG_CHANNELDELETE_STORE', executor), executor ? executor.displayAvatarURL() : undefined);
		}

		if (channel.guild.settings.get('logs.verboseLogging')) {
			embed.addField(channel.guild.language.get('ID'), channel.id);
			embed.addField(channel.guild.language.get('CATEGORY'), channel.parent);
		}
		const logChannel = await this.client.channels.get(channel.guild.settings.get('channels.log'));
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

};
