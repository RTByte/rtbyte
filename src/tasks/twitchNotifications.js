const { Task } = require('klasa');
const fetch = require('node-fetch');
const { apis } = require('../config');

module.exports = class extends Task {

	async run({ guildID }) {
		const guild = this.client.guilds.cache.get(guildID);
		const twitchNotifsEnabled = guild.settings.get('twitch.twitchNotifsEnabled');
		const streamers = guild.settings.get('twitch.streamers');
		if (!twitchNotifsEnabled || streamers.length === 0) return;


		for (let i = 0; i < streamers.length; i++) {
			const twitch = await fetch(`https://api.twitch.tv/helix/streams?first=1&user_login=${streamers[i].name}`,
				{ headers: { Authorization: `Bearer ${this.client.settings.get('twitchOauthBearer')}`, 'Client-ID': apis.twitch } })
				.then(res => res.json());
			const twitchStreamer = await fetch(`https://api.twitch.tv/helix/users?login=${streamers[i].name}`,
				{ headers: { Authorization: `Bearer ${this.client.settings.get('twitchOauthBearer')}`, 'Client-ID': apis.twitch } })
				.then(res => res.json());

			if (!twitch || !twitchStreamer) { continue; }
			// Skip to next streamer if not currently live
			if (twitch.data && !twitch.data.length) { continue; }

			const streamID = twitch.data[0].id;
			const streamer = twitch.data[0].user_name;
			const streamerPic = twitchStreamer.data[0].profile_image_url;
			const streamTitle = twitch.data[0].title;
			const streamThumbnail = twitch.data[0].thumbnail_url
				.replace('{width}', '1280')
				.replace('{height}', '720');
			const streamViewers = twitch.data[0].viewer_count;
			const startedAt = twitch.data[0].started_at;

			// Check if current stream has already been announced and skip to next streamer if it has
			if (streamers[i].latestStream === streamID) { continue; }

			// Remove old stream object and re-add it with the new stream ID
			guild.settings.sync();
			await guild.settings.update('twitch.streamers', streamers[i], { action: 'remove' });
			await guild.settings.update('twitch.streamers', { name: streamer, latestStream: streamID }, { action: 'add' });

			// Emit event so we can post it cleanly
			this.client.emit('twitchStreamerLive', guild, streamer, streamerPic, streamTitle, streamThumbnail, streamViewers, startedAt);
		}
	}

};
