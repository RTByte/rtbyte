const { Command } = require('klasa');
const Case = require('../../lib/structures/Case');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['w'],
			permissionLevel: 5,
			requiredPermissions: ['ADD_REACTIONS', 'USE_EXTERNAL_EMOJIS', 'SEND_MESSAGES', 'EMBED_LINKS'],
			runIn: ['text'],
			description: language => language.get('COMMAND_WARN_DESCRIPTION'),
			usage: '<member:user> <reason:...string>',
			usageDelim: ' '
		});
		this.customizeResponse('member', message =>
			message.language.get('COMMAND_WARN_NOPARAM_MEMBER'))
			.customizeResponse('reason', message =>
				message.language.get('COMMAND_WARN_NOPARAM_REASON'));
	}

	async run(msg, [user, ...reason]) {
		const silent = reason[0].endsWith('-s');
		if (user.id === msg.author.id) return msg.reject(msg.language.get('COMMAND_WARN_NO_WARN_SELF'));
		if (user.id === this.client.user.id) return msg.reject(msg.language.get('COMMAND_WARN_NO_WARN_CLIENT'));
		if (!msg.member.canMod(user)) return msg.reject(msg.language.get('COMMAND_WARN_NO_PERMS', user));

		const modCase = new Case(msg.guild)
			.setUser(user)
			.setType('warn')
			.setReason(reason)
			.setModerator(msg.author)
			.setSilent(silent);
		await modCase.submit();

		const embed = await modCase.embed();
		await embed.send();

		if (silent) return msg.delete({ reason: msg.language.get('COMMAND_MODERATION_SILENT') });

		return msg.affirm();
	}

};
