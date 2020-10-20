const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const { momentThreshold, timezoneWithDate } = require('../../lib/util/util');
const moment = require('moment-timezone');

momentThreshold(moment);

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
			.setColor(this.client.settings.get('colors.white'))
			.addField(msg.language.get('JOIN_POS'), position)
			.addField(msg.language.get('JOINED'), timezoneWithDate(membername.joinedTimestamp, msg.guild))
			.addField(msg.language.get('REGISTERED'), timezoneWithDate(membername.user.createdTimestamp, msg.guild))
			.setThumbnail(membername.user.displayAvatarURL())
			.setTimestamp()
			.setFooter(msg.language.get('COMMAND_REQUESTED_BY', msg), msg.author.displayAvatarURL());

		return msg.send('', { embed: embed });
	}

};
