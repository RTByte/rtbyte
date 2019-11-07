const { Command } = require('klasa');
const { MessageAttachment } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['bigemoji'],
			guarded: true,
			description: language => language.get('COMMAND_ENLARGE_DESCRIPTION'),
			usage: '[emoji:emoji] [emoji:str]'
		});
	}

	async run(msg, [emoji = null, str = null]) {
		if (emoji) {
			const emojiSrc = new MessageAttachment(`https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? 'gif' : 'png'}`);
			return msg.send(emojiSrc);
		}

		if (str && str.match(/<a?:.*:\d{18}?>/)) {
			const extracted = new MessageAttachment(`https://cdn.discordapp.com/emojis/${str.match(/\d{18}?/)[0]}.${!str.match(/<a:.*:\d{18}?>/) ? 'png' : 'gif'}`);
			return msg.send(extracted);
		}

		return msg.send(msg.language.get('COMMAND_ENLARGE_NONE'));
	}

};
