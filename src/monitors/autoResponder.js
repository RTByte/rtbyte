const { Monitor } = require('klasa');

module.exports = class extends Monitor {

	constructor(...args) {
		super(...args, {
			name: 'autoresponder',
			ignoreSelf: true,
			ignoreOthers: false,
			ignoreEdits: false
		});
	}

	run(msg) {
		if (!msg.guild) return;
		if (!msg.guild.settings.get('autoresponder.autoresponderEnabled') || !msg.guild.settings.get('autoresponder.autoresponses').length) return;
		if (msg.guild.settings.get('autoresponder.autoresponderIgnoredChannels').includes(msg.channel.id)) return;
		if (msg.command) return;

		for (const response of msg.guild.settings.get('autoresponder.autoresponses')) {
			const symbolChecker = new RegExp('[^A-Za-z0-9]', 'g');
			const keyword = response.name.match(symbolChecker) ? new RegExp(`\\b(${response.name})\\B`, 'gi') : new RegExp(`\\b(${response.name})\\b`, 'gi');
			const message = response.content.replace('{user}', `${msg.author}`);

			if (msg.content.match(keyword)) msg.send(message);
		}
	}

};
