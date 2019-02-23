const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

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

		if (oldChannel.name !== channel.name) embed.addField(channel.guild.language.get('GUILD_LOG_UPDATE_NAME'), `${oldChannel.name} ${arrowRightEmoji} ${channel.name}`);
		if (oldChannel.nsfw !== channel.nsfw) embed.addField(channel.guild.language.get('GUILD_LOG_CHANNELUPDATE_NSFW'), status[channel.nsfw]);
		if (oldChannel.topic !== channel.topic) embed.addField(channel.guild.language.get('GUILD_LOG_CHANNELUPDATE_TOPIC'), `${oldChannel.topic} ${arrowRightEmoji} ${channel.topic}`);
		if (channel.type === 'voice') embed.setAuthor(channel.name, channel.guild.iconURL()).setFooter(channel.guild.language.get('GUILD_LOG_CHANNELUPDATE_VOICE'));
		if (oldChannel.parent.name !== channel.parent.name) embed.addField(channel.guild.language.get('GUILD_LOG_CHANNELUPDATE_CATEGORY'), `${oldChannel.parent.name} ${arrowRightEmoji} ${channel.parent.name}`); // eslint-disable-line
		await this.permissionUpdateCheck(oldChannel, channel, embed);

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
