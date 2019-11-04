const { Command, Timestamp } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['me', 'myself', 'age'],
			runIn: ['text'],
			description: language => language.get('COMMAND_JOINDATE_DESCRIPTION'),
			usage: '[member:membername]',
			usageDelim: ' '
		});
		this.timestamp = new Timestamp('d MMMM YYYY, h:mm A');
	}

	async run(msg, [membername = msg.member]) {
		const joinPosition = await msg.guild.members.array().sort((first, last) => first.joinedAt - last.joinedAt);

		const position = joinPosition.indexOf(membername) + 1;

		const embed = new MessageEmbed()
			.setAuthor(membername.user.tag, membername.user.displayAvatarURL())
			.setColor(this.client.settings.colors.white)
			.addField(msg.language.get('JOIN_POS'), position)
			.addField(msg.language.get('JOINED'), `${this.timestamp.displayUTC(membername.joinedTimestamp)} (UTC)`, true)
			.addField(msg.language.get('REGISTERED'), `${this.timestamp.displayUTC(membername.user.createdAt)} (UTC)`, true)
			.setThumbnail(membername.user.displayAvatarURL())
			.setTimestamp()
			.setFooter(msg.language.get('COMMAND_REQUESTED_BY', msg), msg.author.displayAvatarURL());

		return msg.send('', { disableEveryone: true, embed: embed });
	}

};
