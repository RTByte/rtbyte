const { Command } = require('klasa');
const Case = require('../../lib/structures/Case');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['k'],
			permissionLevel: 5,
			requiredPermissions: ['KICK_MEMBERS', 'ADD_REACTIONS', 'USE_EXTERNAL_EMOJIS', 'SEND_MESSAGES', 'EMBED_LINKS'],
			runIn: ['text'],
			description: language => language.get('COMMAND_KICK_DESCRIPTION'),
			usage: '<member:user> <reason:...string>',
			usageDelim: ' '
		});
		this.customizeResponse('member', message =>
			message.language.get('COMMAND_KICK_NOPARAM_MEMBER'))
			.customizeResponse('reason', message =>
				message.language.get('COMMAND_KICK_NOPARAM_REASON'));
	}

	async run(msg, [user, ...reason]) {
		const silent = reason[0].endsWith('-s');
		if (user.id === msg.author.id) return msg.reject(msg.language.get('COMMAND_KICK_NO_KICK_SELF'));
		if (user.id === this.client.user.id) return msg.reject(msg.language.get('COMMAND_KICK_NO_KICK_CLIENT'));
		if (!msg.member.canMod(user)) return msg.reject(msg.language.get('COMMAND_KICK_NO_PERMS', user));

		const modCase = new Case(msg.guild)
			.setUser(user)
			.setType('kick')
			.setReason(reason)
			.setModerator(msg.author)
			.setSilent(silent);
		await modCase.submit();

		const member = await msg.guild.members.fetch(user);

		const embed = await modCase.embed();
		await embed.send();

		await member.kick(reason);

		if (silent) return msg.delete({ reason: msg.language.get('COMMAND_MODERATION_SILENT') });

		return msg.affirm();
	}

};
