const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const { Colors } = require('../../lib/util/constants');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['details', 'what'],
			guarded: true,
			description: language => language.get('COMMAND_INFO_DESCRIPTION'),
			runIn: ['text', 'dm']
		});
	}

	async run(msg) {
		const embed = new MessageEmbed()
			.setAuthor(msg.language.get('COMMAND_INFO_EMBEDTITLE'), this.client.user.displayAvatarURL())
			.setColor(Colors.white)
			.setDescription(msg.language.get('COMMAND_INFO_EMBEDDESC'))
			.addField(msg.language.get('COMMAND_INFO_OURTEAM'), msg.language.get('COMMAND_INFO_TEAMLIST'), true)
			.addField(msg.language.get('COMMAND_INFO_LINKS'), msg.language.get('COMMAND_INFO_LINKLIST'), true)
			.setThumbnail(this.client.user.displayAvatarURL(), 50, 50)
			.setImage('https://rtbyte.xyz/img/og-img.jpg')
			.setTimestamp()
			.setFooter(msg.language.get('COMMAND_REQUESTED_BY', msg), msg.author.displayAvatarURL());
		return msg.send('', { embed: embed });
	}

};
