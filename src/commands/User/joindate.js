const { Command, Timestamp } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['me', 'myself', 'age'],
			runIn: ['text'],
			description: language => language.get('COMMAND_JOINDATE_DESCRIPTION'),
			usage: '[Member:member]',
			usageDelim: ' '
		});
		this.timestamp = new Timestamp('d MMMM YYYY, h:mm A');
	}

	async run(msg, [member = msg.member]) {
		const embed = new MessageEmbed()
			.setAuthor(member.user.tag, member.user.displayAvatarURL())
			.setColor(this.client.settings.colors.white)
			.addField('Registered', this.timestamp.displayUTC(member.user.createdAt))
			.addField('Joined', this.timestamp.displayUTC(member.joinedTimestamp));

		return msg.send('', { disableEveryone: true, embed: embed });
	}

};