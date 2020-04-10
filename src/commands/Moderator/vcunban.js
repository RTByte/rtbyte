const { Command } = require('klasa');
const { ModCase } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['vub', 'vcub'],
			permissionLevel: 6,
			requiredPermissions: ['MANAGE_ROLES', 'MANAGE_CHANNELS', 'ADD_REACTIONS', 'USE_EXTERNAL_EMOJIS', 'SEND_MESSAGES', 'EMBED_LINKS'],
			requiredSettings: ['roles.voiceBanned'],
			runIn: ['text'],
			description: language => language.get('COMMAND_VCUNBAN_DESCRIPTION'),
			usage: '<member:username>',
			usageDelim: ' '
		});
		this.customizeResponse('member', message =>
			message.language.get('COMMAND_VCUNBAN_NOPARAM'));
	}

	async run(msg, [username]) {
		if (!msg.guild.settings.roles.voiceBanned || !msg.guild.roles.has(msg.guild.settings.roles.voiceBanned)) await this.createRole(msg.guild);

		if (username.id === msg.author.id) return msg.reject(msg.language.get('COMMAND_VCUNBAN_NO_VCUNBAN_SELF'));
		if (username.id === this.client.user.id) return msg.reject(msg.language.get('COMMAND_VCUNBAN_NO_VCUNBAN_CLIENT'));
		if (!await msg.member.canMod(username)) return msg.reject(msg.language.get('COMMAND_VCUNBAN_NO_PERMS', username));

		const modCase = new ModCase(msg.guild)
			.setUser(username)
			.setType('vcunban')
			.setModerator(msg.author);
		await modCase.submit();

		const member = await msg.guild.members.fetch(username);

		if (!member.roles.has(msg.guild.settings.roles.voiceBanned)) return msg.affirm();
		const voiceBannedRole = await msg.guild.roles.get(msg.guild.settings.roles.voiceBanned);
		await member.roles.remove(voiceBannedRole);

		const embed = await modCase.embed();
		await embed.send();

		return msg.affirm();
	}

	async createRole(guild) {
		const vcban = await this.client.commands.get('vcban');
		return vcban.createRole(guild);
	}

};
