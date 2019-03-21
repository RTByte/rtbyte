const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['details', 'what'],
			guarded: true,
			description: language => language.get('COMMAND_INFO_DESCRIPTION')
		});
	}

	async run(msg) {
		const embed = new MessageEmbed()
			.setAuthor(msg.guild.language.get('COMMAND_INFO_EMBEDTITLE'), this.client.user.displayAvatarURL())
			.setColor('#ffffff')
			.setDescription(msg.guild.language.get('COMMAND_INFO_EMBEDDESC'))
			.addField(msg.guild.language.get('COMMAND_INFO_OURTEAM'), msg.guild.language.get('COMMAND_INFO_TEAMLIST'), true)
			.addField(msg.guild.language.get('COMMAND_INFO_LINKS'), msg.guild.language.get('COMMAND_INFO_LINKLIST'), true)
			.setThumbnail(this.client.user.displayAvatarURL(), 50, 50)
			.setTimestamp()
			.setFooter(msg.language.get('COMMAND_REQUESTED_BY', msg), msg.author.displayAvatarURL());

		return msg.send('', { disableEveryone: true, embed: embed });
	}

};
