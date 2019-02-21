const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['choose', 'decide'],
			description: language => language.get('COMMAND_CHOICE_DESCRIPTION'),
			usage: '<Choices:str> [...]',
			usageDelim: ', '
		});
	}

	async run(msg, [...choices]) {
		const validChoices = choices.filter(choice => choice);

		if (validChoices.length === 1) {
			return msg.reply('\n🤔 You only gave me one choice.');
		} else {
			return msg.reply(`\n🤔 ${choices[Math.floor(Math.random() * choices.length)]}.`);
		}
	}

};