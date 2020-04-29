const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'twitchStreamerLive' });
	}

	async run(guild, streamer, streamerPic, streamTitle, streamThumbnail, streamViewers, startedAt) {
		if (!guild) return;

		if (guild.settings.get('twitch.twitchNotifsChannel')) await this.announceStream(guild, streamer, streamerPic, streamTitle, streamThumbnail, streamViewers, startedAt);

		return;
	}

	async announceStream(guild, streamer, streamerPic, streamTitle, streamThumbnail, streamViewers, startedAt) {
		const embed = new MessageEmbed()
			.setAuthor(streamer, 'https://i.imgur.com/8uLz7KW.png')
			.setColor(this.client.settings.get('colors.purple'))
			.setTitle(streamTitle)
			.setDescription(guild.language.get('NOTIFICATION_TWITCH_LINK', streamer))
			.setThumbnail(streamerPic)
			.addField(guild.language.get('NOTIFICATION_TWITCH_VIEWERS'), streamViewers)
			.setImage(streamThumbnail)
			.setTimestamp(startedAt)
			.setFooter('twitch.tv', 'https://i.imgur.com/haYO7V0.png');
		const role = await guild.roles.get(guild.settings.get('twitch.twitchNotifsRole'));
		const channel = await this.client.channels.get(guild.settings.get('twitch.twitchNotifsChannel'));
		await channel.send(role, { embed: embed });

		return;
	}

};
