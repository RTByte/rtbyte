const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['choose', 'decide'],
			description: language => language.get('COMMAND_CHOICE_DESCRIPTION'),
			runIn: ['text', 'dm'],
			usage: '<choices:str> [...]',
			usageDelim: ', '
		});
		this.customizeResponse('choices', message =>
			message.language.get('COMMAND_CHOICE_NOPARAM'));
	}

	async run(msg, [...choices]) {
		const validChoices = choices.filter(choice => choice);

		if (validChoices.length < 2) {
			return msg.reply(msg.language.get('COMMAND_CHOICE_NOTENOUGH'));
		} else {
			return msg.reply(`\n🤔 ${choices[Math.floor(Math.random() * choices.length)]}.`);
		}
	}

};
