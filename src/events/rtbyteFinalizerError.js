const { Event } = require('klasa');
const Sentry = require('@sentry/node');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'finalizerError' });
	}

	async run(message, command, response, timer, finalizer, error) {
		Sentry.withScope(scope => {
			scope.setTag('error-type', 'finalizer');
			scope.setLevel(this.client.options.production ? 'error' : 'debug');
			scope.setContext('Message', message);

			Sentry.captureException(error);
		});
	}

};
