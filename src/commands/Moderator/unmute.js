const { Command } = require('klasa');
const { ModCase } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['um', 'untimeout'],
			permissionLevel: 6,
			requiredPermissions: ['MANAGE_ROLES', 'MANAGE_CHANNELS', 'ADD_REACTIONS', 'USE_EXTERNAL_EMOJIS', 'SEND_MESSAGES', 'EMBED_LINKS'],
			requiredSettings: ['roles.muted'],
			runIn: ['text'],
			description: language => language.get('COMMAND_UNMUTE_DESCRIPTION'),
			usage: '<member:username>',
			usageDelim: ' '
		});
		this.customizeResponse('member', message =>
			message.language.get('COMMAND_UNMUTE_NOPARAM'));
	}

	async run(msg, [username]) {
		if (!msg.guild.settings.get('roles.muted') || !msg.guild.roles.has(msg.guild.settings.get('roles.muted'))) await this.createRole(msg.guild);

		if (username.id === msg.author.id) return msg.reject(msg.language.get('COMMAND_UNMUTE_NO_UNMUTE_SELF'));
		if (username.id === this.client.user.id) return msg.reject(msg.language.get('COMMAND_UNMUTE_NO_UNMUTE_CLIENT'));
		if (!await msg.member.canMod(username)) return msg.reject(msg.language.get('COMMAND_UNMUTE_NO_PERMS', username));

		const modCase = new ModCase(msg.guild)
			.setUser(username)
			.setType('unmute')
			.setModerator(msg.author);
		await modCase.submit();

		const member = await msg.guild.members.fetch(username);

		if (!member.roles.has(msg.guild.settings.get('roles.muted'))) return msg.affirm();
		const mutedRole = await msg.guild.roles.get(msg.guild.settings.get('roles.muted'));
		await member.roles.remove(mutedRole);

		const embed = await modCase.embed();
		await embed.send();

		return msg.affirm();
	}

	async createRole(guild) {
		const mute = await this.client.commands.get('mute');
		return mute.createRole(guild);
	}

};
