const { Command } = require('klasa');
const { ModCase } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['m', 'tm', 'timeout'],
			permissionLevel: 6,
			requiredPermissions: ['MANAGE_ROLES', 'MANAGE_CHANNELS', 'ADD_REACTIONS', 'USE_EXTERNAL_EMOJIS', 'SEND_MESSAGES', 'EMBED_LINKS'],
			requiredSettings: ['roles.muted'],
			runIn: ['text'],
			description: language => language.get('COMMAND_MUTE_DESCRIPTION'),
			usage: '<member:username> [when:time] [reason:...string] [-s]',
			usageDelim: ' '
		});
		this.customizeResponse('member', message =>
			message.language.get('COMMAND_MUTE_NOPARAM_MEMBER'));
	}

	async run(msg, [username, when = null, ...reason]) {
		if (!Array.isArray(reason) || !reason.length) reason.unshift('Unspecified');
		const silent = reason[0].endsWith('-s');
		if (silent) reason[0].replace('-s', '');
		if (!msg.guild.settings.get('roles.muted') || !msg.guild.roles.cache.has(msg.guild.settings.get('roles.muted'))) await this.createRole(msg.guild);

		if (username.id === msg.author.id) return msg.reject(msg.language.get('COMMAND_MUTE_NO_MUTE_SELF'));
		if (username.id === this.client.user.id) return msg.reject(msg.language.get('COMMAND_MUTE_NO_MUTE_CLIENT'));
		if (!await msg.member.canMod(username)) return msg.reject(msg.language.get('COMMAND_MUTE_NO_PERMS', username));

		const modCase = new ModCase(msg.guild)
			.setUser(username)
			.setType('mute')
			.setReason(reason)
			.setModerator(msg.author)
			.setSilent(silent)
			.setDuration(when);
		await modCase.submit();

		const member = await msg.guild.members.fetch(username);

		if (member.roles.cache.has(msg.guild.settings.get('roles.muted'))) return msg.affirm();
		const mutedRole = await msg.guild.roles.cache.get(msg.guild.settings.get('roles.muted'));
		await member.roles.add(mutedRole);

		if (when) {
			await this.client.schedule.create('timedMute', when, {
				data: {
					guildID: msg.guild.id,
					userID: member.id,
					modID: msg.author.id
				},
				catchUp: true
			});
		}

		const embed = await modCase.embed();
		await embed.send();

		if (silent) return msg.delete({ reason: msg.language.get('COMMAND_MODERATION_SILENT') });

		return msg.affirm();
	}

	async createRole(guild) {
		const mutedRole = await guild.roles.create({ data: { name: 'Muted' }, reason: `${this.client.user.username} initialization: Muted role` });
		await guild.settings.update('roles.muted', mutedRole, guild);

		await guild.channels.forEach(async (channel) => {
			if (channel.type === 'text') {
				await channel.updateOverwrite(mutedRole, {
					CREATE_INSTANT_INVITE: false,
					ADD_REACTIONS: false,
					SEND_MESSAGES: false,
					SEND_TTS_MESSAGES: false,
					EMBED_LINKS: false,
					ATTACH_FILES: false,
					USE_EXTERNAL_EMOJIS: false
				},
				`${this.client.user.username} initialization: Adjusting channel permissions for muted role`);
			}

			if (channel.type === 'voice') {
				await channel.updateOverwrite(mutedRole, { SPEAK: false }, `${this.client.user.username} initialization: Adjusting channel permissions for muted role`);
			}
		});

		return;
	}

};
