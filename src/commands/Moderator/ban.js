const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			permissionLevel: 5,
			requiredPermissions: ['BAN_MEMBERS', 'ADD_REACTIONS', 'USE_EXTERNAL_EMOJIS'],
			runIn: ['text'],
			description: (msg) => msg.language.get('COMMAND_BAN_DESCRIPTION'),
			usage: '<member:user> <reason:string> [...]',
			usageDelim: ' '
		});
	}

	async run(msg, [user, ...reason]) {
		if (user.id === msg.author.id) throw msg.language.get('COMMAND_BAN_NO_BAN_SELF');
		if (user.id === this.client.user.id) throw msg.language.get('COMMAND_BAN_NO_BAN_CLIENT');
		if (!msg.member.canMod(user)) throw msg.language.get('COMMAND_BAN_NO_PERMS', user);

		const options = {};
		reason = reason.join(' ');
		if (reason) options.reason = reason;

		await msg.guild.members.ban(user, options);

		if (reason.includes('-s', reason.length - 2)) return msg.delete({ reason: msg.language.get('COMMAND_MODERATION_SILENT') });

		return msg.affirm();
	}

};
