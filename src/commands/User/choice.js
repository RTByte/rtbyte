const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['choose', 'decide'],
			description: (msg) => msg.language.get('COMMAND_CHOICE_DESCRIPTION'),
			usage: '<Choices:str> [...]',
			usageDelim: ', '
		});
	}

	async run(msg, [...choices]) {
		const validChoices = choices.filter(x => x);

		if (validChoices.length === 1) {
			return msg.reply('🤔 You only gave me one choice.');
		} else {
			return msg.reply(`🤔 ${choices[Math.floor(Math.random() * choices.length)]}.`);
		}
	}

};
