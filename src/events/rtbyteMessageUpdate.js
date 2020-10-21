const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');
const { Colors } = require('../lib/util/constants');
const { truncate } = require('../lib/util/util');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'messageUpdate'	});
	}

	async run(old, msg) {
		if (!msg.guild) return;

		if (msg.guild.me.hasPermission('VIEW_AUDIT_LOG')) {
			const auditLog = await msg.guild.fetchAuditLogs();
			const logEntry = await auditLog.entries.first();

			if (logEntry && logEntry.action === 'MESSAGE_PIN' && msg.pinned) this.client.emit('messagePin', msg, logEntry.executor);
		}

		if (msg.guild.settings.get('channels.log') && msg.guild.settings.get('logs.events.messageUpdate') && old.content !== msg.content) await this.serverLog(old, msg);

		return;
	}

	async serverLog(old, msg) {
		const embed = new MessageEmbed()
			.setAuthor(msg.author.tag, msg.author.displayAvatarURL())
			.setColor(Colors.blue)
			.setDescription(`${msg.channel}\n[${msg.language.get('CLICK_TO_VIEW')}](${msg.url})`)
			.setTimestamp()
			.setFooter(msg.language.get('GUILD_LOG_MESSAGEUPDATE'));

		if (old.content) embed.addField(msg.language.get('GUILD_LOG_BEFORE'), truncate(old.content));
		if (msg.content) embed.addField(msg.language.get('GUILD_LOG_AFTER'), truncate(msg.content));

		// Message attachment checks.
		let attachment;
		if (msg.attachments) {
			const atchs = msg.attachments.map(atch => atch.proxyURL);
			const atchSize = msg.attachments.map(atch => atch.size)[0] < 8388119;
			if (atchs.filter(pURL => pURL.endsWith('.mp4')).length || atchs.filter(pURL => pURL.endsWith('.webm')).length || atchs.filter(pURL => pURL.endsWith('.mov')).length) {
				if (atchSize) {
					await embed.attachFiles(atchs[0]);
				} else {
					await embed.addField('‎', msg.language.get('GUILD_LOG_MESSAGEDELETE_TOOBIG', msg.url));
				}
			} else if (msg.attachments.size > 1) {
				[attachment] = [atchs[0]];
				await embed.addField('‎', msg.language.get('GUILD_LOG_MESSAGEDELETE_MULTIPLE_ATCH'));
				await embed.setImage(attachment);
			} else {
				[attachment] = [atchs[0]];
				await embed.setImage(attachment);
			}
		}

		const logChannel = await this.client.channels.cache.get(msg.guild.settings.get('channels.log'));
		if (logChannel) await logChannel.send('', { embed: embed });

		return;
	}

};
