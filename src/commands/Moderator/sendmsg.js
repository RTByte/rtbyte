const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			requiredPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			aliases: ['sendmessage', 'message', 'msg'],
			permissionLevel: 5,
			description: language => language.get('COMMAND_SENDMSG_DESCRIPTION'),
			extendedHelp: '',
			usage: '<targetUser:user|targetChannel:channel> <message:...string>',
			usageDelim: ' '
		});
		this.customizeResponse('message', message =>
			message.language.get('COMMAND_SENDMSG_NOPARAM'));
	}

	async run(msg, [target, ...message]) {
		if (await this.canSend(msg, target)) {
			try {
				await msg.delete();
				if (!target.constructor.name === 'KlasaUser') {
					return target.send(message);
				} else if (target.constructor.name === 'KlasaUser') {
					// eslint-disable-next-line max-len
					return target.send(message).then(target.send(`This message was sent from the **${msg.guild.name}** Discord and can not be replied to. If you have any questions regarding the contents of it, please contact a moderator.`));
				}
				return target.send(message);
			} catch (err) {
				await this.client.emit('taskError', err);
				return msg.reject();
			}
		}
		return msg.delete();
	}

	async canSend(msg, target) {
		if (target.constructor.name === 'TextChannel') {
			return target.guild === msg.guild;
		}

		if (target.constructor.name === 'KlasaUser') {
			return await msg.guild.members.has(target.id);
		}

		return false;
	}

};
