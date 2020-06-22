const { Task } = require('klasa');
const fetch = require('node-fetch');
const { apis } = require('../config');

module.exports = class extends Task {

	async run() {
		const twitchOauth = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${apis.twitch}&client_secret=${apis.twitchSecret}&grant_type=client_credentials`, { method: 'POST' })
			.then(res => res.json());
		const accessToken = twitchOauth.access_token;

		await this.client.settings.sync();
		await this.client.settings.update('twitchOauthBearer', accessToken);
	}

};
