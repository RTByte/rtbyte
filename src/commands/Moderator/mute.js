const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['m'],
			permissionLevel: 5,
			requiredPermissions: ['MANAGE_ROLES', 'MANAGE_CHANNELS', 'ADD_REACTIONS', 'USE_EXTERNAL_EMOJIS', 'SEND_MESSAGES', 'EMBED_LINKS'],
			runIn: ['text'],
			description: (msg) => msg.language.get('COMMAND_MUTE_DESCRIPTION'),
			usage: '<member:user> <reason:string> [...]',
			usageDelim: ' '
		});
	}

	async run(msg, [user, ...reason]) {
		if (!msg.guild.configs.roles.muted || !msg.guild.roles.has(msg.guild.configs.roles.muted)) await this.createRole(msg.guild);

		if (user.id === msg.author.id) throw msg.language.get('COMMAND_MUTE_NO_MUTE_SELF');
		if (user.id === this.client.user.id) throw msg.language.get('COMMAND_MUTE_NO_MUTE_CLIENT');
		if (!msg.member.canMod(user)) throw msg.language.get('COMMAND_MUTE_NO_PERMS', user);

		reason = reason.join(' ');

		const member = await msg.guild.members.fetch(user);
		if (member.roles.has(msg.guild.configs.roles.muted)) return msg.affirm();
		const mutedRole = await msg.guild.roles.get(msg.guild.configs.roles.muted);
		await member.roles.add(mutedRole);

		if (msg.guild.configs.logs.guildMemberMute) await this.muteLog(member, reason);

		if (reason.includes('-s', reason.length - 2)) return msg.delete({ reason: msg.language.get('COMMAND_MODERATION_SILENT') });

		return msg.affirm();
	}

	async muteLog(member, reason) {
		const embed = new MessageEmbed()
			.setAuthor(`${member.user.tag} - (${member.id})`, member.user.avatarURL())
			.setColor('#ff0000')
			.setTimestamp()
			.addField(member.guild.language.get('GUILD_LOG_REASON'), reason)
			.setFooter(member.guild.language.get('GUILD_LOG_GUILDMEMBERMUTE'));

		const logChannel = await this.client.channels.get(member.guild.configs.channels.serverLog);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

	async init() {
		await this.ensureGuildVars();
		return;
	}

	async ensureGuildVars() {
		if (!this.client.gateways.guilds.schema.has('roles')) await this.client.gateways.guilds.schema.add('roles');
		if (!this.client.gateways.guilds.schema.roles.has('muted')) await this.client.gateways.guilds.schema.roles.add('muted', { type: 'Role', array: false });
		if (!this.client.gateways.guilds.schema.has('logs')) await this.client.gateways.guilds.schema.add('logs');
		if (!this.client.gateways.guilds.schema.logs.has('guildMemberMute')) await this.client.gateways.guilds.schema.logs.add('guildMemberMute', { type: 'Boolean', array: false, default: true });
		return;
	}

	async createRole(guild) {
		const mutedRole = await guild.roles.create({ data: { name: 'Muted' }, reason: `${this.client.user.username} initialization: Muted Role` });
		await guild.configs.update({ roles: { muted: mutedRole } }, guild);

		await guild.channels.forEach(async (channel) => {
			if (channel.type === 'text') {
				await channel.overwritePermissions({
					overwrites: [{ id: mutedRole.id, denied: ['CREATE_INSTANT_INVITE', 'ADD_REACTIONS', 'SEND_MESSAGES', 'SEND_TTS_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES', 'USE_EXTERNAL_EMOJIS'] }],
					reason: `${this.client.user.username} initialization: Denying text channel permissions for Muted Role`
				});
			}

			if (channel.type === 'voice') {
				await channel.overwritePermissions({
					overwrites: [{ id: mutedRole.id, denied: ['SPEAK'] }],
					reason: `${this.client.user.username} initialization: Denying voice channel permissions for Muted and Voice Chat Banned Roles`
				});
			}
		});

		return;
	}

};
