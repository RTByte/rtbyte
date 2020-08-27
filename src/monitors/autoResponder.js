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

		const msgContent = msg.content.toLowerCase();
		for (const response of msg.guild.settings.get('autoResponder.autoResponses')) {
			const keyword = new RegExp(`\\b(${response.name})\\b`, 'g');
			if (msgContent.match(keyword)) msg.send(response.content);
		}
	}

};
