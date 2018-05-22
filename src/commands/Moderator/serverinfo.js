const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			requiredPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			aliases: ['sinfo', 'guildinfo'],
			permissionLevel: 5,
			description: (msg) => msg.language.get('COMMAND_SERVERINFO_DESCRIPTION'),
			extendedHelp: ''
		});
	}

	async run(msg) {
		const embed = new MessageEmbed()
			.setAuthor(msg.guild.name, msg.guild.iconURL())
			.setColor('#ffffff')
			.addField('ID', msg.guild.id, true)
			.addField('Name', msg.guild.name, true)
			.addField('Owner', msg.guild.owner, true)
			.addField('Members', msg.guild.memberCount, true)
			.addField('Channels', msg.guild.channels.size, true)
			.addField('Emojis', `${msg.guild.emojis.size}/50`, true)
			.addField('Roles', msg.guild.roles.size, true)
			.addField('Region', msg.guild.region, true)
			.addField('Created on', msg.guild.createdAt, true)
			.setThumbnail(msg.guild.iconURL(), 50, 50)
			.setImage(msg.guild.splashURL())
			.setTimestamp()
			.setFooter(`Requested by ${msg.author.tag}`, msg.author.avatarURL());
		return msg.channel.send('', { disableEveryone: true, embed: embed });
	}

};
