const { Event } = require('klasa');
const Sentry = require('@sentry/node');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'eventError' });
	}

	async run(event, args, error) {
		Sentry.withScope(scope => {
			scope.setTag('error-type', 'event');
			scope.setLevel(this.client.options.production ? 'error' : 'debug');

			Sentry.captureException(error);
		});
	}

};
