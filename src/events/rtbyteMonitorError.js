const { Event } = require('klasa');
const Sentry = require('@sentry/node');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'monitorError' });
	}

	async run(message, monitor, error) {
		Sentry.withScope(scope => {
			scope.setTag('error-type', 'monitor');
			scope.setLevel(this.client.options.production ? 'error' : 'debug');
			scope.setContext('Message', message);

			Sentry.captureException(error);
		});
	}

};
