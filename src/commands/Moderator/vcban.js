const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['vb', 'vcb'],
			permissionLevel: 5,
			requiredPermissions: ['MANAGE_ROLES', 'MANAGE_CHANNELS', 'ADD_REACTIONS', 'USE_EXTERNAL_EMOJIS', 'SEND_MESSAGES', 'EMBED_LINKS'],
			runIn: ['text'],
			description: language => language.get('COMMAND_VCBAN_DESCRIPTION'),
			usage: '<member:user> [when:time] <reason:...string>',
			usageDelim: ' '
		});
	}

	async run(msg, [user, when, ...reason]) {
		if (!msg.guild.settings.roles.voiceBanned || !msg.guild.roles.has(msg.guild.settings.roles.voiceBanned)) await this.createRole(msg.guild);

		if (user.id === msg.author.id) return msg.reject(msg.language.get('COMMAND_VCBAN_NO_VCBAN_SELF'));
		if (user.id === this.client.user.id) return msg.reject(msg.language.get('COMMAND_VCBAN_NO_VCBAN_CLIENT'));
		if (!await msg.member.canMod(user)) return msg.reject(msg.language.get('COMMAND_VCBAN_NO_PERMS', user));

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
					guild: msg.guild.id,
					user: member.id
				}
			});
		}

		if (msg.guild.settings.logs.events.guildMemberVCBanAdd) await this.vcbanLog(member, reason);

		if (reason.includes('-s', reason.length - 2)) return msg.delete({ reason: msg.language.get('COMMAND_MODERATION_SILENT') });

		return msg.affirm();
	}

	async vcbanLog(member, reason) {
		const embed = new MessageEmbed()
			.setAuthor(`${member.user.tag} - (${member.id})`, member.user.displayAvatarURL())
			.setColor(this.client.settings.colors.red)
			.setTimestamp()
			.addField(member.guild.language.get('GUILD_LOG_REASON'), reason)
			.setFooter(member.guild.language.get('GUILD_LOG_GUILDMEMBERVCBAN'));

		const logChannel = await this.client.channels.get(member.guild.settings.channels.log);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		// eslint-disable-next-line max-len
		if (member.guild.settings.moderation.notifyUser && !reason.includes('-s', reason.length - 2)) await member.send(member.guild.language.get('COMMAND_MODERATION_BOILERPLATE', member.guild), { disableEveryone: true, embed: embed });
		return;
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
