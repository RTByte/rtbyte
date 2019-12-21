const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['coin'],
			description: language => language.get('COMMAND_COINFLIP_DESCRIPTION'),
			runIn: ['text', 'dm'],
			usage: ''
		});
	}

	async run(msg) {
		return msg.reply(`\n${Math.random() > 0.5 ? `${msg.language.get('COMMAND_COINFLIP_HEADS')}` : `${msg.language.get('COMMAND_COINFLIP_TAILS')}`}.`);
	}

};
