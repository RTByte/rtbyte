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

		// Config checks
		// Checks server and client configs to see if the deleted channel has been configured anywhere. If it has, resets or removes it.
		if (channel.id === channel.guild.settings.get('channels.log')) await channel.guild.settings.reset('channels.log');
		if (channel.id === channel.guild.settings.get('greetings.welcomeChannel')) await channel.guild.settings.reset('greetings.welcomeChannel');
		if (channel.id === channel.guild.settings.get('greetings.dismissChannel')) await channel.guild.settings.reset('greetings.dismissChannel');
		if (channel.id === channel.guild.settings.get('boards.starboard.starboardChannel')) await channel.guild.settings.reset('boards.starboard.starboardChannel');
		if (channel.id === channel.guild.settings.get('boards.pinboard.pinboardChannel')) await channel.guild.settings.reset('boards.pinboard.pinboardChannel');
		if (channel.id === channel.guild.settings.get('twitch.twitchNotifsChannel')) await channel.guild.settings.reset('twitch.twitchNotifsChannel');

		// Reset won't work for arrays of channel IDs, and we can't use update() with a deleted channel.
		if (channel.guild.settings.get('boards.starboard.starboardIgnoredChannels').includes(channel.id)) {
			// Capture old list of channels
			const oldList = channel.guild.settings.get('boards.starboard.starboardIgnoredChannels');

			// Reset current list
			await channel.guild.settings.reset('boards.starboard.starboardIgnoredChannels');

			// Declare new list without the deleted channel and re-add the other ones
			const newList = oldList.filter(chnl => chnl !== channel.id);
			for (let i = 0; i < newList.length; i++) {
				await channel.guild.settings.sync();
				await channel.guild.settings.update('boards.starboard.starboardIgnoredChannels', newList[i]);
			}
		}
		if (channel.guild.settings.get('boards.pinboard.pinboardIgnoredChannels').includes(channel.id)) {
			// Capture old list of channels
			const oldList = channel.guild.settings.get('boards.pinboard.pinboardIgnoredChannels');

			// Reset current list
			await channel.guild.settings.reset('boards.pinboard.pinboardIgnoredChannels');

			// Declare new list without the deleted channel and re-add the other ones
			const newList = oldList.filter(chnl => chnl !== channel.id);
			for (let i = 0; i < newList.length; i++) {
				await channel.guild.settings.sync();
				await channel.guild.settings.update('boards.pinboard.pinboardIgnoredChannels', newList[i]);
			}
		}

		// Add check for the global log channel, just in case.
		if (channel.id === this.client.settings.get('channels.globalLog')) await this.client.settings.reset('channels.globalLog');

		return;
	}

	async serverLog(channel, executor) {
		const embed = new MessageEmbed()
			.setAuthor(`#${channel.name}`, channel.guild.iconURL())
			.setColor(this.client.settings.get('colors.red'))
			.addField(channel.guild.language.get('ID'), channel.id)
			.addField(channel.guild.language.get('CATEGORY'), channel.parent)
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

		const logChannel = await this.client.channels.get(channel.guild.settings.get('channels.log'));
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

};
