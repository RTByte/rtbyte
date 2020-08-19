const { version: klasaVersion } = require('klasa');
const { version: discordVersion } = require('discord.js');
const { sentryIngestURL } = require('../config');
const Sentry = require('@sentry/node');
const os = require('os');

Sentry.init({
	dsn: sentryIngestURL,
	// eslint-disable-next-line no-process-env
	release: `rtbyte@${process.env.npm_package_version}`
});

Sentry.configureScope(scope => {
	scope.setTags({
		host: `${os.hostname}`,
		'klasa-version': klasaVersion,
		'd.js-version': discordVersion
	});
	scope.setLevel(this.client.options.production ? 'error' : 'debug');
});

if (sentryIngestURL) console.log('Sentry.io error reporting is active.');
