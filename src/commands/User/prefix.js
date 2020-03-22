const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			guarded: true,
			description: language => language.get('COMMAND_PREFIX_DESCRIPTION'),
			runIn: ['text', 'dm']
		});
	}

	async run(msg) {
		return msg.send(msg.language.get('PREFIX_REMINDER'));
	}

};
