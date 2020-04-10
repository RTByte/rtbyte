const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const moment = require('moment-timezone');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['me', 'myself', 'age'],
			runIn: ['text'],
			description: language => language.get('COMMAND_JOINDATE_DESCRIPTION'),
			usage: '[member:membername]',
			usageDelim: ' '
		});
	}

	async run(msg, [membername = msg.member]) {
		const joinPosition = await msg.guild.members.cache.array().sort((first, last) => first.joinedAt - last.joinedAt);

		const position = joinPosition.indexOf(membername) + 1;

		const embed = new MessageEmbed()
			.setAuthor(membername.user.tag, membername.user.displayAvatarURL())
			.setColor(this.client.settings.colors.white)
			.addField(msg.language.get('JOIN_POS'), position)
			.addField(msg.language.get('JOINED'), moment.tz(membername.joinedTimestamp, msg.guild.settings.timezone).format('Do MMMM YYYY, h:mmA zz'))
			.addField(msg.language.get('REGISTERED'), moment.tz(membername.user.createdTimestamp, msg.guild.settings.timezone).format('Do MMMM YYYY, h:mmA zz'))
			.setThumbnail(membername.user.displayAvatarURL())
			.setTimestamp()
			.setFooter(msg.language.get('COMMAND_REQUESTED_BY', msg), msg.author.displayAvatarURL());

		return msg.send('', { disableEveryone: true, embed: embed });
	}

};
