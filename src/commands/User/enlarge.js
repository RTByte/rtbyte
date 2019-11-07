const { Command } = require('klasa');
const { MessageAttachment } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['bigemoji'],
			guarded: true,
			description: language => language.get('COMMAND_ENLARGE_DESCRIPTION'),
			usage: '<emoji:emoji>'
		});
		this.customizeResponse('emoji', msg =>
			msg.language.get('COMMAND_ENLARGE_NOTFOUND'));
	}

	async run(msg, [emoji]) {
		const emojiSrc = new MessageAttachment(`https://cdn.discordapp.com/emojis/${emoji.id}.png`);
		msg.send(emojiSrc);
	}

};
