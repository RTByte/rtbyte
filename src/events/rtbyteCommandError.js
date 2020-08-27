const { Event } = require('klasa');
const Sentry = require('@sentry/node');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'commandError' });
	}

	async run(message, command, params, error) {
		Sentry.withScope(scope => {
			scope.setTag('error-type', 'command');
			scope.setLevel(this.client.options.production ? 'error' : 'debug');
			scope.setContext('Message', message);

			Sentry.captureException(error);
		});

		return message.reject(message.language.get('COMMAND_ERROR'));
	}

};
