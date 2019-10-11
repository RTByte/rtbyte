const { Command } = require('klasa');
const moment = require('moment');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['remindme', 'remind', 'setreminder'],
			runIn: ['text'],
			description: language => language.get('COMMAND_REMINDER_DESCRIPTION'),
			usage: '<when:time> <message:...string>',
			usageDelim: ' '
		});
		this.customizeResponse('when', message =>
			message.language.get('COMMAND_REMINDER_NOPARAM_WHEN'))
			.customizeResponse('message', message =>
				message.language.get('COMMAND_REMINDER_NOPARAM_MESSAGE'));
	}

	async run(msg, [when, ...message]) {
		const sendInDM = message[0].endsWith('-dm');

		await this.client.schedule.create('reminder', when, {
			data: {
				guildID: msg.guild.id,
				channelID: msg.channel.id,
				userID: msg.author.id,
				dmBool: sendInDM,
				reminderMsg: message[0].replace(' -dm', ''),
				timestamp: moment().format()
			}
		});

		return msg.affirm();
	}

};
