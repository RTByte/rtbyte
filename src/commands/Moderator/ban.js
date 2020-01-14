const { Command } = require('klasa');
const { ModCase } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['b'],
			permissionLevel: 6,
			requiredPermissions: ['BAN_MEMBERS', 'ADD_REACTIONS', 'USE_EXTERNAL_EMOJIS'],
			runIn: ['text'],
			description: language => language.get('COMMAND_BAN_DESCRIPTION'),
			usage: '<member:username> [when:time] [reason:...string] [-s]',
			usageDelim: ' '
		});
		this.customizeResponse('member', message =>
			message.language.get('COMMAND_BAN_NOPARAM_MEMBER'))
			.customizeResponse('reason', message =>
				message.language.get('COMMAND_MODERATION_NOREASON'));
	}

	async run(msg, [username, when = null, ...reason]) {
		if (!Array.isArray(reason) || !reason.length) reason.unshift('Unspecified');
		const silent = reason[0].endsWith('-s');
		if (silent) reason[0].replace('-s', '');

		if (username.id === msg.author.id) return msg.reject(msg.language.get('COMMAND_BAN_NO_BAN_SELF'));
		if (username.id === this.client.user.id) return msg.reject(msg.language.get('COMMAND_BAN_NO_BAN_CLIENT'));
		if (!msg.member.canMod(username)) return msg.reject(msg.language.get('COMMAND_BAN_NO_PERMS', username));

		reason += ' (fc)';

		const modCase = new ModCase(msg.guild)
			.setUser(username)
			.setType('ban')
			.setReason(`${reason}`)
			.setModerator(msg.author)
			.setSilent(silent)
			.setDuration(when);
		await modCase.submit();

		const embed = await modCase.embed();
		await embed.send();

		await msg.guild.members.ban(username, { days: 1, reason: when ? `${msg.language.get('GUILD_LOG_GUILDBANADD_TIMED', when)} | ${reason}` : reason });

		if (when) {
			await this.client.schedule.create('timedBan', when, {
				data: {
					guildID: msg.guild.id,
					userID: username.id
				},
				catchUp: true
			});
		}

		if (silent) return msg.delete({ reason: msg.language.get('COMMAND_MODERATION_SILENT') });

		return msg.affirm();
	}

};
