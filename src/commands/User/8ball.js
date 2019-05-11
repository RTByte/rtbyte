const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['mirror', 'magicconch'],
			description: language => language.get('COMMAND_8BALL_DESCRIPTION'),
			usage: '<question:str>'
		});
		this.customizeResponse('question', message =>
			message.language.get('COMMAND_8BALL_NOPARAM'));
	}

	async run(msg) {
		return msg.reply(`\n🎱 ${msg.guild.language.get('COMMAND_8BALL_ANSWERS')[Math.floor(Math.random() * msg.guild.language.get('COMMAND_8BALL_ANSWERS').length)]}`);
	}

};
