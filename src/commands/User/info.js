const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['details', 'what'],
			guarded: true,
			description: language => language.get('COMMAND_INFO_DESCRIPTION'),
			enabled: false
		});
	}

	async run(message) {
		const embed = new MessageEmbed()
			.setAuthor('COMMAND_INFO_TITLE', this.client.user.displayAvatarURL());

		return message.send('', { disableEveryone: true, embed: embed });
	}

};
