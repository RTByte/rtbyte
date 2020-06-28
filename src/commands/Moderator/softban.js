const { Command } = require('klasa');
const { ModCase } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['sb'],
			permissionLevel: 6,
			requiredPermissions: ['BAN_MEMBERS', 'ADD_REACTIONS', 'USE_EXTERNAL_EMOJIS'],
			runIn: ['text'],
			description: language => language.get('COMMAND_SOFTBAN_DESCRIPTION'),
			usage: '<member:username> [reason:...string] [-s]',
			usageDelim: ' '
		});
		this.customizeResponse('member', message =>
			message.language.get('COMMAND_SOFTBAN_NOPARAM_MEMBER'));
	}

	async run(msg, [username, ...reason]) {
		if (!Array.isArray(reason) || !reason.length) reason.unshift('Unspecified');
		const silent = reason[0].endsWith('-s');
		if (silent) reason[0].replace('-s', '');

		if (username.id === msg.author.id) return msg.reject(msg.language.get('COMMAND_SOFTBAN_NO_SOFTBAN_SELF'));
		if (username.id === this.client.user.id) return msg.reject(msg.language.get('COMMAND_SOFTBAN_NO_SOFTBAN_CLIENT'));
		if (!await msg.member.canMod(username)) return msg.reject(msg.language.get('COMMAND_SOFTBAN_NO_PERMS', username));

		reason += ' (fc)';

		const modCase = new ModCase(msg.guild)
			.setUser(username)
			.setType('softban')
			.setReason(reason)
			.setModerator(msg.author)
			.setSilent(silent);
		await modCase.submit();

		const embed = await modCase.embed();
		await embed.send();

		await msg.guild.members.ban(username, { days: 1, reason: reason });
		await msg.guild.members.unban(username, msg.language.get('COMMAND_SOFTBAN_SOFTBAN_RELEASED'));

		if (silent) return msg.delete({ reason: msg.language.get('COMMAND_MODERATION_SILENT') });

		return msg.affirm();
	}

};
