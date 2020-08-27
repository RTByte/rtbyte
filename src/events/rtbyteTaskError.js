const { Event } = require('klasa');
const Sentry = require('@sentry/node');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'taskError' });
	}

	async run(scheduledTask, task, error) {
		Sentry.withScope(scope => {
			scope.setTag('error-type', 'task');
			scope.setLevel(this.client.options.production ? 'error' : 'debug');
			scope.setContext(scheduledTask);

			Sentry.captureException(error);
		});
	}

};
