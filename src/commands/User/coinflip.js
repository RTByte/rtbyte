const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			aliases: ['coin', 'flip'],
			description: (msg) => msg.language.get('COMMAND_COINFLIP_DESCRIPTION')
		});
	}

	async run(msg) {
		return msg.reply(`${Math.random() > 0.5 ? '🙂 heads' : '🙃 tails'}.`);
	}

};
