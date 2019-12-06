/* eslint-disable complexity */
const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');
const moment = require('moment');

moment.relativeTimeThreshold('s', 60);
moment.relativeTimeThreshold('ss', 0);
moment.relativeTimeThreshold('m', 60);

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'channelUpdate'	});
	}

	async run(oldChannel, channel) {
		if (!channel.guild) return;
		if (channel.guild.available && channel.guild.settings.logs.events.channelUpdate) await this.channelUpdateLog(oldChannel, channel);

		return;
	}

	async channelUpdateLog(oldChannel, channel) {
		const affirmEmoji = this.client.emojis.get(this.client.settings.emoji.affirm);
		const rejectEmoji = this.client.emojis.get(this.client.settings.emoji.reject);
		const arrowRightEmoji = this.client.emojis.get(this.client.settings.emoji.arrowRight);
		const status = {
			true: affirmEmoji,
			false: rejectEmoji
		};

		const embed = new MessageEmbed()
			.setAuthor(`#${channel.name}`, channel.guild.iconURL())
			.setColor(this.client.settings.colors.blue)
			.setTimestamp()
			.setFooter(channel.guild.language.get('GUILD_LOG_CHANNELUPDATE'));

		// Change author and footer fields if channel is voice channel
		if (channel.type === 'voice') {
			await embed.setAuthor(channel.name, channel.guild.iconURL());
			await embed.setFooter(channel.guild.language.get('GUILD_LOG_CHANNELUPDATE_VOICE'));
		}

		// Change author and footer fields if channel is category
		if (channel.type === 'category') {
			await embed.setAuthor(channel.name, channel.guild.iconURL());
			await embed.setFooter(channel.guild.language.get('GUILD_LOG_CHANNELUPDATE_CATEGORY'));
		}

		// Change author and footer fields if channel is news channel
		if (channel.type === 'news') {
			await embed.setFooter(channel.guild.language.get('GUILD_LOG_CHANNELUPDATE_NEWS'));
		}

		// Change author and footer fields if channel is store channel
		if (channel.type === 'store') {
			await embed.setFooter(channel.guild.language.get('GUILD_LOG_CHANNELUPDATE_STORE'));
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

		const logChannel = await this.client.channels.get(channel.guild.settings.channels.log);
		await logChannel.send('', { disableEveryone: true, embed: embed });
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
			if (!channel.permissionOverwrites.has(overwrite.id)) return embed.addField(channel.guild.language.get('GUILD_LOG_CHANNELUPDATE_PERMISSIONOVERWRITEREMOVE'), subject);

			return null;
		});
	}

	async resolveSubject(channel, overwrite) {
		if (overwrite.type === 'member') return channel.guild.members.resolve(overwrite.id);
		if (overwrite.type === 'role') return channel.guild.roles.resolve(overwrite.id);
		return null;
	}

};
