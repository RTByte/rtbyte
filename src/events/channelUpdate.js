/* eslint-disable complexity */
const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');
const { momentThreshold } = require('../lib/util/Util');
const moment = require('moment');

momentThreshold(moment);

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'channelUpdate'	});
	}

	async run(oldChannel, channel) {
		if (!channel.guild) return;

		let executor;
		if (channel.guild.me.hasPermission('VIEW_AUDIT_LOG')) {
			const auditLog = await channel.guild.fetchAuditLogs();
			const logEntry = await auditLog.entries.first();

			if (logEntry.action === 'CHANNEL_UPDATE') executor = logEntry ? logEntry.executor : undefined;
		}

		if (channel.guild.settings.get('channels.log') && channel.guild.settings.get('logs.events.channelUpdate')) await this.serverLog(oldChannel, channel, executor);

		return;
	}

	async serverLog(oldChannel, channel, executor) {
		const affirmEmoji = this.client.emojis.get(this.client.settings.get('emoji.affirm'));
		const rejectEmoji = this.client.emojis.get(this.client.settings.get('emoji.reject'));
		const arrowRightEmoji = this.client.emojis.get(this.client.settings.get('emoji.arrowRight'));
		const status = {
			true: affirmEmoji,
			false: rejectEmoji
		};

		const embed = new MessageEmbed()
			.setAuthor(`#${channel.name}`, channel.guild.iconURL())
			.setColor(this.client.settings.get('colors.blue'))
			.setTimestamp()
			.setFooter(channel.guild.language.get('GUILD_LOG_CHANNELUPDATE', executor), executor ? executor.displayAvatarURL() : undefined);

		// Change author and footer fields if channel is voice channel
		if (channel.type === 'voice') {
			await embed.setAuthor(channel.name, channel.guild.iconURL());
			await embed.setFooter(channel.guild.language.get('GUILD_LOG_CHANNELUPDATE_VOICE', executor), executor ? executor.displayAvatarURL() : undefined);
		}

		// Change author and footer fields if channel is category
		if (channel.type === 'category') {
			await embed.setAuthor(channel.name, channel.guild.iconURL());
			await embed.setFooter(channel.guild.language.get('GUILD_LOG_CHANNELUPDATE_CATEGORY', executor), executor ? executor.displayAvatarURL() : undefined);
		}

		// Change footer field if channel is news channel
		if (channel.type === 'news') {
			await embed.setFooter(channel.guild.language.get('GUILD_LOG_CHANNELUPDATE_NEWS', executor), executor ? executor.displayAvatarURL() : undefined);
		}

		// Change footer field if channel is store channel
		if (channel.type === 'store') {
			await embed.setFooter(channel.guild.language.get('GUILD_LOG_CHANNELUPDATE_STORE', executor), executor ? executor.displayAvatarURL() : undefined);
		}

		// Name changed
		if (oldChannel.name !== channel.name) await embed.addField(channel.guild.language.get('NAME_CHANGED'), `${oldChannel.name} ${arrowRightEmoji} ${channel.name}`);

		// NSFW toggled
		if (oldChannel.nsfw !== channel.nsfw) await embed.addField(channel.guild.language.get('GUILD_LOG_CHANNELUPDATE_NSFW'), status[channel.nsfw]);

		// Topic changed
		// eslint-disable-next-line max-len
		if (oldChannel.topic !== channel.topic) await embed.addField(channel.guild.language.get('GUILD_LOG_CHANNELUPDATE_TOPIC'), `\`${oldChannel.topic || channel.guild.language.get('GUILD_LOG_CHANNELUPDATE_TOPIC_NONE')}\` ${arrowRightEmoji} \`${channel.topic || channel.guild.language.get('GUILD_LOG_CHANNELUPDATE_TOPIC_NONE')}\``);

		// Slowmode interval changed
		// eslint-disable-next-line max-len
		if (oldChannel.rateLimitPerUser !== channel.rateLimitPerUser) await embed.addField(channel.guild.language.get('GUILD_LOG_CHANNELUPDATE_SLOWMODE'), `${oldChannel.rateLimitPerUser > 0 ? moment.duration(oldChannel.rateLimitPerUser, 's').humanize() : channel.guild.language.get('OFF')} ${arrowRightEmoji} ${channel.rateLimitPerUser > 0 ? moment.duration(channel.rateLimitPerUser, 's').humanize() : channel.guild.language.get('OFF')}`);

		// Bitrate changed
		// eslint-disable-next-line max-len
		if (oldChannel.bitrate !== channel.bitrate) await embed.addField(channel.guild.language.get('GUILD_LOG_CHANNELUPDATE_BITRATE'), `${(oldChannel.bitrate / 1000).toFixed(0)}kbps ${arrowRightEmoji} ${(channel.bitrate / 1000).toFixed(0)}kbps`);

		// User limit changed
		// eslint-disable-next-line max-len
		if (oldChannel.userLimit !== channel.userLimit) await embed.addField(channel.guild.language.get('GUILD_LOG_CHANNELUPDATE_USERLIMIT'), `${oldChannel.userLimit > 0 ? oldChannel.userLimit : channel.guild.language.get('UNLIMITED')} ${channel.guild.language.get('USERS').toLowerCase()} ${arrowRightEmoji} ${channel.userLimit > 0 ? channel.userLimit : channel.guild.language.get('UNLIMITED')} ${channel.guild.language.get('USERS').toLowerCase()}`);

		// Channel moved to different category
		// eslint-disable-next-line max-len
		if (oldChannel.parent !== channel.parent) await embed.addField(channel.guild.language.get('GUILD_LOG_CHANNELUPDATE_PARENT'), `${oldChannel.parent || channel.guild.language.get('GUILD_LOG_CHANNELUPDATE_PARENT_NONE')} ${arrowRightEmoji} ${channel.parent || channel.guild.language.get('GUILD_LOG_CHANNELUPDATE_PARENT_NONE')}`);


		await this.permissionUpdateCheck(oldChannel, channel, embed);

		if (!embed.fields.length) return;

		const logChannel = await this.client.channels.get(channel.guild.settings.get('channels.log'));
		if (logChannel) await logChannel.send('', { disableEveryone: true, embed: embed });

		return;
	}

	async permissionUpdateCheck(oldChannel, channel, embed) {
		await channel.permissionOverwrites.forEach(async (overwrite) => {
			const subject = await this.resolveSubject(channel, overwrite);
			if (!oldChannel.permissionOverwrites.has(overwrite.id)) return embed.addField(channel.guild.language.get('GUILD_LOG_CHANNELUPDATE_PERMISSIONOVERWRITECREATE'), subject);

			const oldOverwrite = await oldChannel.permissionOverwrites.get(overwrite.id);
			if (oldOverwrite.allow.bitfield !== overwrite.allow.bitfield || oldOverwrite.deny.bitfield !== overwrite.deny.bitfield) return embed.addField(channel.guild.language.get('GUILD_LOG_CHANNELUPDATE_PERMISSIONOVERWRITEUPDATE'), subject); // eslint-disable-line

			return null;
		});
		await oldChannel.permissionOverwrites.forEach(async (overwrite) => {
			const subject = await this.resolveSubject(channel, overwrite);
			if (!channel.permissionOverwrites.has(overwrite.id) && subject) return embed.addField(channel.guild.language.get('GUILD_LOG_CHANNELUPDATE_PERMISSIONOVERWRITEREMOVE'), subject);

			return null;
		});
	}

	async resolveSubject(channel, overwrite) {
		if (overwrite.type === 'member') return channel.guild.members.resolve(overwrite.id);
		if (overwrite.type === 'role') return channel.guild.roles.resolve(overwrite.id);
		return null;
	}

};
