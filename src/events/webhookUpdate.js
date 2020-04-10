/* eslint-disable id-length */
const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'webhookUpdate' });
	}

	async run(channel) {
		if (!channel.guild) return;

		if (channel.guild.me.hasPermission('VIEW_AUDIT_LOG')) {
			const auditLog = await channel.guild.fetchAuditLogs();
			const logEntry = await auditLog.entries.first();

			const { executor, target } = logEntry;

			const oldWebhook = {
				channel: logEntry.changes.find(o => o.key === 'channel_id') ? channel.guild.channels.cache.get(logEntry.changes.find(o => o.key === 'channel_id').old) : undefined,
				name: logEntry.changes.find(o => o.key === 'name') ? logEntry.changes.find(o => o.key === 'name').old : undefined,
				avatar: logEntry.changes.find(o => o.key === 'avatar_hash') ?
					`https://cdn.discordapp.com/avatars/${logEntry.target.id}/${logEntry.changes.find(o => o.key === 'avatar_hash').old}.jpg` : undefined
			};

			const webhook = {
				channel: channel.guild.channels.cache.get(target.channelID),
				name: target.name,
				avatar: `https://cdn.discordapp.com/avatars/${logEntry.target.id}/${logEntry.target.avatar}.jpg`
			};

			if (logEntry.action === 'WEBHOOK_CREATE') this.client.emit('webhookCreate', channel, executor, webhook);
			if (logEntry.action === 'WEBHOOK_DELETE') this.client.emit('webhookDelete', channel, executor, oldWebhook);
			if (logEntry.action === 'WEBHOOK_UPDATE' && channel.guild.settings.channels.log && channel.guild.settings.logs.events.webhookCreate) {
				await this.serverLog(channel, executor, oldWebhook, webhook);
			}
		}

		return;
	}

	async serverLog(channel, executor, oldWebhook, webhook) {
		const arrowRightEmoji = this.client.emojis.cache.get(this.client.settings.emoji.arrowRight);

		const embed = new MessageEmbed()
			.setAuthor(webhook.name, webhook.avatar)
			.setColor(this.client.settings.colors.blue)
			.setTimestamp()
			.setFooter(channel.guild.language.get('GUILD_LOG_WEBHOOKUPDATE', executor), executor ? executor.displayAvatarURL() : undefined);

		// Channel changed
		if (oldWebhook.channel !== undefined && oldWebhook.channel !== webhook.channel) {
			await embed.addField(channel.guild.language.get('GUILD_LOG_WEBHOOKUPDATE_CHANNEL'), `${oldWebhook.channel} ${arrowRightEmoji} ${webhook.channel}`, true);
		}

		// Name changed
		if (oldWebhook.name !== undefined && oldWebhook.name !== webhook.name) {
			await embed.addField(channel.guild.language.get('NAME_CHANGED'), `${oldWebhook.name} ${arrowRightEmoji} ${webhook.name}`, true);
		}

		// Avatar changed
		if (oldWebhook.avatar !== undefined && oldWebhook.avatar !== webhook.avatar) {
			await embed.setTitle(channel.guild.language.get('GUILD_LOG_WEBHOOKUPDATE_AVATAR'));
		}

		const logChannel = await this.client.channels.cache.get(channel.guild.settings.channels.log);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

};
