const { Command } = require('klasa');
const { ModCase } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['w'],
			permissionLevel: 6,
			requiredPermissions: ['ADD_REACTIONS', 'USE_EXTERNAL_EMOJIS', 'SEND_MESSAGES', 'EMBED_LINKS'],
			runIn: ['text'],
			description: language => language.get('COMMAND_WARN_DESCRIPTION'),
			usage: '<member:username> [reason:...string] [-s]',
			usageDelim: ' '
		});
		this.customizeResponse('member', message =>
			message.language.get('COMMAND_WARN_NOPARAM_MEMBER'));
	}

	async run(msg, [username, ...reason]) {
		if (!Array.isArray(reason) || !reason.length) reason.unshift('Unspecified');
		const silent = reason[0].endsWith('-s');
		if (silent) reason[0].replace('-s', '');

		if (username.id === msg.author.id) return msg.reject(msg.language.get('COMMAND_WARN_NO_WARN_SELF'));
		if (username.id === this.client.user.id) return msg.reject(msg.language.get('COMMAND_WARN_NO_WARN_CLIENT'));
		if (!msg.member.canMod(username)) return msg.reject(msg.language.get('COMMAND_WARN_NO_PERMS', username));

		const modCase = new ModCase(msg.guild)
			.setUser(username)
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
