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
	}

	async run(msg, [emoji]) {
		const emojiSrc = new MessageAttachment(`https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? 'gif' : 'png'}`);
		msg.send(emojiSrc);
	}

};
