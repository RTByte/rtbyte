const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			permissionLevel: 5,
			requiredPermissions: ['BAN_MEMBERS'],
			runIn: ['text'],
			description: 'Bans a mentioned user and logs the reason.',
			usage: '<member:user> <reason:string> [...]',
			usageDelim: ' '
		});
	}

	async run(msg, [user, ...reason]) {
		if (user.id === msg.author.id) throw 'Why would you ban yourself?';
		if (user.id === this.client.user.id) throw 'Have I done something wrong?';

		if (!msg.member.canMod(user)) throw `You don't have permission to moderate ${user}`;

		const options = {};
		reason = reason.join(' ');
		if (reason) options.reason = reason;

		await msg.guild.members.ban(user, options);
		if (reason.includes('-s', reason.length - 2)) return msg.delete({ reason: 'Silent action' });
		return msg.sendMessage(`${user.tag} got banned.${reason ? ` With reason of: ${reason}` : ''}`); // eslint-disable-line
	}

};
