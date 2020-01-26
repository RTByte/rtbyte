const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['videolink', 'screenshare', 'camera', 'videochat'],
			description: language => language.get('COMMAND_CALL_DESCRIPTION'),
			runIn: ['text']
		});
	}

	async run(msg) {
		if (!msg.member.voice.channel) return msg.reject(msg.language.get('COMMAND_CALL_NOTVC'));
		return msg.send(`https://discordapp.com/channels/${msg.guild.id}/${msg.member.voice.channel.id}/`, { disableEveryone: false });
	}

};
