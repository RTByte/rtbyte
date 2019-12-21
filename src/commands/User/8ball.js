const { Command } = require('klasa');
const { MessageAttachment } = require('discord.js');
const fetch = require('node-fetch');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['mirror', 'magicconch'],
			description: language => language.get('COMMAND_8BALL_DESCRIPTION'),
			runIn: ['text', 'dm'],
			usage: '<question:str>'
		});
		this.customizeResponse('question', message =>
			message.language.get('COMMAND_8BALL_NOPARAM'));
	}

	async run(msg) {
		const chance = Math.random() * 100;
		if (chance > 85) {
			let attachment;
			fetch('https://yesno.wtf/api')
				.then(res => res.json())
				.then(json => {
					attachment = new MessageAttachment(json.image);
					msg.reply('\n🎱', attachment);
				});
			return true;
		}
		return msg.reply(`\n🎱 ${msg.language.get('COMMAND_8BALL_ANSWERS')[Math.floor(Math.random() * msg.language.get('COMMAND_8BALL_ANSWERS').length)]}`);
	}

};
