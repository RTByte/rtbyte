const { Monitor } = require('klasa');

module.exports = class extends Monitor {

	constructor(...args) {
		super(...args, {
			name: 'autoResponder',
			ignoreSelf: true,
			ignoreOthers: false,
			ignoreEdits: false
		});
	}

	run(msg) {
		if (!msg.guild) return;
		if (!msg.guild.settings.get('autoResponder.autoResponderEnabled') || !msg.guild.settings.get('autoResponder.autoResponses').length) return;
		if (msg.command) return;

		for (const response of msg.guild.settings.get('autoResponder.autoResponses')) {
			const symbolChecker = new RegExp('[^A-Za-z0-9]', 'g');
			const keyword = response.name.match(symbolChecker) ? new RegExp(`\\b(${response.name})\\B`, 'gi') : new RegExp(`\\b(${response.name})\\b`, 'gi');
			const message = response.content.replace('{user}', `${msg.author}`);

			if (msg.content.match(keyword)) msg.send(message);
		}
	}

};
