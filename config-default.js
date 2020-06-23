exports.config = {
	/**
     * Suggested RTByte Developer Client Options
	 * Make a copy of this file with your relevant information and rename it config.js
     */
	controlGuild: '',
	botOwners: [''],
	production: false,
	prefix: '-',
	preserveSettings: true,
	commandEditing: true,
	commandLogging: true,
	consoleEvents: {
		debug: false,
		error: true,
		log: true,
		verbose: true,
		warn: true,
		wtf: true
	}
};

// API tokens you'll need to run the bot
exports.apis = {
	genius: '',
	google: '',
	darksky: '',
	twitch: '',
	twitchSecret: ''
};

// The token for this bot to login with
exports.token = '';
