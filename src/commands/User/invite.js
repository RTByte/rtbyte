const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const { Colors } = require('../../lib/util/constants');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text', 'dm'],
			guarded: true,
			description: language => language.get('COMMAND_INVITE_DESCRIPTION')
		});
	}

	async run(msg) {
		const embed = new MessageEmbed()
			.setAuthor(msg.language.get('COMMAND_INVITE_EMBEDTITLE'), this.client.user.displayAvatarURL())
			.setColor(Colors.white)
			.setDescription(msg.language.get('COMMAND_INVITE_EMBEDDESC'))
			.setThumbnail(this.client.user.displayAvatarURL(), 50, 50)
			.setTimestamp()
			.setFooter(msg.language.get('COMMAND_REQUESTED_BY', msg), msg.author.displayAvatarURL());
		return msg.send('', { embed: embed });
	}

	async init() {
		if (this.client.application && !this.client.application.botPublic) this.permissionLevel = 10;
	}

};
