const { Command } = require('klasa');
const moment = require('moment');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['remindme', 'remind', 'setreminder'],
			runIn: ['text', 'dm'],
			description: language => language.get('COMMAND_REMINDER_DESCRIPTION'),
			usage: '<when:time> <message:...string> [-dm]',
			usageDelim: ' '
		});
		this.customizeResponse('when', message =>
			message.language.get('COMMAND_REMINDER_NOPARAM_WHEN'))
			.customizeResponse('message', message =>
				message.language.get('COMMAND_REMINDER_NOPARAM_MESSAGE'));
	}

	async run(msg, [when, ...message]) {
		const sendInDM = message[0].endsWith('-dm');
		if (sendInDM) message[0].replace('-dm', '');

		await this.client.schedule.create('reminder', when, {
			data: {
				guildID: msg.guild ? msg.guild.id : null,
				channelID: msg.guild ? msg.channel.id : msg.author.id,
				userID: msg.author.id,
				dmBool: sendInDM,
				reminderMsg: message,
				timestamp: moment().format()
			},
			catchUp: true
		});

		return msg.affirm();
	}

};
