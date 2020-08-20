const { version: klasaVersion } = require('klasa');
const { version: discordVersion } = require('discord.js');
const { sentryIngestURL } = require('../config');
const Sentry = require('@sentry/node');
const os = require('os');
const chalk = require('chalk');

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
});

if (sentryIngestURL) console.log(chalk.black.bgWhite('Sentry error reporting is active.\n'));
