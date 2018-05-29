const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['me', 'myself', 'age'],
			permissionLevel: 0,
			requiredPermissions: ['ADD_REACTIONS', 'USE_EXTERNAL_EMOJIS', 'SEND_MESSAGES', 'EMBED_LINKS'],
			runIn: ['text'],
			description: (msg) => msg.language.get('COMMAND_JOINDATE_DESCRIPTION'),
			usage: '[target:member]',
			usageDelim: ' '
		});
	}

	async run(msg, target = msg.member) {
		const embed = new MessageEmbed()
			.setAuthor(target.user.tag, target.user.avatarURL())
			.setColor(this.client.configs.colors.blurple)
			.addField('Joined Discord', target.user.createdAt, true)
			.addField('Joined Server', target.joinedAt, true);

		return msg.send('', { disableEveryone: true, embed: embed });
	}

};
