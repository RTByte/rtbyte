const { Command } = require('klasa');
const { ModCase } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['vb', 'vcb'],
			permissionLevel: 6,
			requiredPermissions: ['MANAGE_ROLES', 'MANAGE_CHANNELS', 'ADD_REACTIONS', 'USE_EXTERNAL_EMOJIS', 'SEND_MESSAGES', 'EMBED_LINKS'],
			runIn: ['text'],
			description: language => language.get('COMMAND_VCBAN_DESCRIPTION'),
			usage: '<member:user> [when:time] <reason:...string>',
			usageDelim: ' '
		});
		this.customizeResponse('member', message =>
			message.language.get('COMMAND_VCBAN_NOPARAM_MEMBER'))
			.customizeResponse('reason', message =>
				message.language.get('COMMAND_MODERATION_NOREASON'));
	}

	async run(msg, [user, when = null, ...reason]) {
		const silent = reason[0].endsWith('-s');
		if (!msg.guild.settings.roles.voiceBanned || !msg.guild.roles.has(msg.guild.settings.roles.voiceBanned)) await this.createRole(msg.guild);

		if (user.id === msg.author.id) return msg.reject(msg.language.get('COMMAND_VCBAN_NO_VCBAN_SELF'));
		if (user.id === this.client.user.id) return msg.reject(msg.language.get('COMMAND_VCBAN_NO_VCBAN_CLIENT'));
		if (!await msg.member.canMod(user)) return msg.reject(msg.language.get('COMMAND_VCBAN_NO_PERMS', user));

		const modCase = new ModCase(msg.guild)
			.setUser(user)
			.setType('vcban')
			.setReason(reason)
			.setModerator(msg.author)
			.setSilent(silent)
			.setDuration(when);
		await modCase.submit();

		const member = await msg.guild.members.fetch(user);

		if (member.voice) {
			const vckick = await this.client.commands.get('vckick');
			await vckick.run(msg, [user, ...reason]);
		}

		if (member.roles.has(msg.guild.settings.roles.voiceBanned)) return msg.affirm();
		const voiceBannedRole = await msg.guild.roles.get(msg.guild.settings.roles.voiceBanned);
		await member.roles.add(voiceBannedRole);

		if (when) {
			await this.client.schedule.create('timedVCBan', when, {
				data: {
					guildID: msg.guild.id,
					userID: member.id
				}
			});
		}

		const embed = await modCase.embed();
		await embed.send();

		if (silent) return msg.delete({ reason: msg.language.get('COMMAND_MODERATION_SILENT') });

		return msg.affirm();
	}

	async createRole(guild) {
		const voiceBannedRole = await guild.roles.create({ data: { name: 'Voice Chat Banned' }, reason: `${this.client.user.username} initialization: Voice Chat Banned Role` });
		await guild.settings.update('roles.voiceBanned', voiceBannedRole.id, guild);

		await guild.channels.forEach(async (channel) => {
			if (channel.type === 'voice') {
				await channel.updateOverwrite(voiceBannedRole, {
					CONNECT: false,
					SPEAK: false
				},
				`${this.client.user.username} initialization: Adjusting Channel Permissions for Voice Chat Banned role`);
			}
		});

		return;
	}

};
