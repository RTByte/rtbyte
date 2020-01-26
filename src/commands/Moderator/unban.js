const { Command } = require('klasa');
const { ModCase } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['ub'],
			permissionLevel: 6,
			requiredPermissions: ['BAN_MEMBERS', 'ADD_REACTIONS', 'USE_EXTERNAL_EMOJIS'],
			runIn: ['text'],
			description: language => language.get('COMMAND_UNBAN_DESCRIPTION'),
			usage: '<member:username> [reason:...string] [-s]',
			usageDelim: ' '
		});
		this.customizeResponse('member', message =>
			message.language.get('COMMAND_UNBAN_NOPARAM_MEMBER'));
	}

	async run(msg, [username, ...reason]) {
		if (!Array.isArray(reason) || !reason.length) reason.unshift('Unspecified');
		const silent = reason[0].endsWith('-s');
		if (silent) reason[0].replace('-s', '');

		const bans = await msg.guild.fetchBans();
		if (!bans.has(username.id)) return msg.reject(msg.language.get('COMMAND_UNBAN_NOT_BANNED'));

		reason += ' (fc)';

		const modCase = new ModCase(msg.guild)
			.setUser(username)
			.setType('unban')
			.setReason(reason)
			.setModerator(msg.author)
			.setSilent(silent);
		await modCase.submit();

		const embed = await modCase.embed();
		await embed.send();

		await msg.guild.members.unban(username, reason);

		if (silent) return msg.delete({ reason: msg.language.get('COMMAND_MODERATION_SILENT') });

		return msg.affirm();
	}

};
