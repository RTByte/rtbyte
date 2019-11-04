const { Command } = require('klasa');
const { ModCase } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['k'],
			permissionLevel: 6,
			requiredPermissions: ['KICK_MEMBERS', 'ADD_REACTIONS', 'USE_EXTERNAL_EMOJIS', 'SEND_MESSAGES', 'EMBED_LINKS'],
			runIn: ['text'],
			description: language => language.get('COMMAND_KICK_DESCRIPTION'),
			usage: '<member:username> [reason:...string] [-s]',
			usageDelim: ' '
		});
		this.customizeResponse('member', message =>
			message.language.get('COMMAND_KICK_NOPARAM_MEMBER'));
	}

	async run(msg, [username, ...reason]) {
		if (!Array.isArray(reason) || !reason.length) reason.unshift('Unspecified');
		const silent = reason[0].endsWith('-s');
		if (silent) reason[0].replace('-s', '');

		if (username.id === msg.author.id) return msg.reject(msg.language.get('COMMAND_KICK_NO_KICK_SELF'));
		if (username.id === this.client.user.id) return msg.reject(msg.language.get('COMMAND_KICK_NO_KICK_CLIENT'));
		if (!msg.member.canMod(username)) return msg.reject(msg.language.get('COMMAND_KICK_NO_PERMS', username));

		const modCase = new ModCase(msg.guild)
			.setUser(username)
			.setType('kick')
			.setReason(reason)
			.setModerator(msg.author)
			.setSilent(silent);
		await modCase.submit();

		const member = await msg.guild.members.fetch(username);

		const embed = await modCase.embed();
		await embed.send();

		await member.kick(reason);

		if (silent) return msg.delete({ reason: msg.language.get('COMMAND_MODERATION_SILENT') });

		return msg.affirm();
	}

};
