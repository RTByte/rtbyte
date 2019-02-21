const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['b'],
			permissionLevel: 5,
			requiredPermissions: ['BAN_MEMBERS', 'ADD_REACTIONS', 'USE_EXTERNAL_EMOJIS'],
			runIn: ['text'],
			description: language => language.get('COMMAND_BAN_DESCRIPTION'),
			usage: '<member:user> <reason:string> [...]',
			usageDelim: ' '
		});
	}

	async run(msg, [user, ...reason]) {
		if (user.id === msg.author.id) return msg.reject(msg.language.get('COMMAND_BAN_NO_BAN_SELF'));
		if (user.id === this.client.user.id) return msg.reject(msg.language.get('COMMAND_BAN_NO_BAN_CLIENT'));
		if (!msg.member.canMod(user)) return msg.reject(msg.language.get('COMMAND_BAN_NO_PERMS', user));

		reason = reason.join(' ');

		await msg.guild.members.ban(user, { days: 1, reason: reason });

		if (reason.includes('-s', reason.length - 2)) return msg.delete();

		return msg.affirm();
	}

};