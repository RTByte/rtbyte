const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');
const { truncate } = require('../lib/util/util');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'messageDelete'	});
	}

	async run(msg) {
		if (!msg.guild) return;

		if (msg.guild.settings.get('channels.log') && msg.guild.settings.get('logs.events.messageDelete')) await this.serverLog(msg);

		return;
	}

	async serverLog(msg) {
		const embed = new MessageEmbed()
			.setAuthor(msg.author.tag, msg.author.displayAvatarURL())
			.setDescription(msg.channel)
			.setColor(this.client.settings.get('colors.blue'))
			.setTimestamp()
			.setFooter(msg.language.get('GUILD_LOG_MESSAGEDELETE'));

		if (msg.content) await embed.addField(msg.guild.language.get('MESSAGE'), truncate(msg.content));
		if (msg.embeds.length) await embed.addField('‎', msg.language.get('GUILD_LOG_MESSAGEDELETE_EMBED'));

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
