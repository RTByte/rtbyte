exports.config = {
	/**
     * Suggested RTByte Developer Client Options
	 * Make a copy of this file with your relevant information and rename it config.js
     */
	controlGuild: '',
	controlGuildDeveloperRole: '',
	botOwners: [''],

	prefix: 'r!',
	noPrefixDM: true,

	production: false,
	disableMentions: 'everyone',
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
	},

	readyMessage: (client) => `Successfully initialized. Ready to serve ${client.guilds.cache.size} guild${client.guilds.cache.size === 1 ? '' : 's'}.`

};

// API tokens you'll need to run the bot
exports.apis = {
	genius: '',
	google: '',
	darksky: '',
	twitch: '',
	twitchSecret: ''
};

// Sentry.io ingestion URL
exports.sentryIngestURL = '';

// The token for this bot to login with
exports.token = '';
