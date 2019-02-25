const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['m'],
			permissionLevel: 5,
			requiredPermissions: ['MANAGE_ROLES', 'MANAGE_CHANNELS', 'ADD_REACTIONS', 'USE_EXTERNAL_EMOJIS', 'SEND_MESSAGES', 'EMBED_LINKS'],
			runIn: ['text'],
			description: language => language.get('COMMAND_MUTE_DESCRIPTION'),
			usage: '<member:user> [when:time] <reason:...string>',
			usageDelim: ' '
		});
	}

	async run(msg, [user, when, ...reason]) {
		if (!msg.guild.settings.roles.muted || !msg.guild.roles.has(msg.guild.settings.roles.muted)) await this.createRole(msg.guild);

		if (user.id === msg.author.id) return msg.reject(msg.language.get('COMMAND_MUTE_NO_MUTE_SELF'));
		if (user.id === this.client.user.id) return msg.reject(msg.language.get('COMMAND_MUTE_NO_MUTE_CLIENT'));
		if (!await msg.member.canMod(user)) return msg.reject(msg.language.get('COMMAND_MUTE_NO_PERMS', user));

		const member = await msg.guild.members.fetch(user);

		if (member.roles.has(msg.guild.settings.roles.muted)) return msg.affirm();
		const mutedRole = await msg.guild.roles.get(msg.guild.settings.roles.muted);
		await member.roles.add(mutedRole);

		if (when) {
			await this.client.schedule.create('timedUnmute', when, {
				data: {
					guild: msg.guild.id,
					user: member.id
				}
			});
		}

		if (msg.guild.settings.logs.events.guildMemberMute) await this.muteLog(member, when, reason);

		if (reason.includes('-s', reason.length - 2)) return msg.delete({ reason: msg.language.get('COMMAND_MODERATION_SILENT') });

		return msg.affirm();
	}

	async muteLog(member, when, reason) {
		const embed = new MessageEmbed()
			.setAuthor(`${member.user.tag} (${member.id})`, member.user.displayAvatarURL())
			.setColor(this.client.settings.colors.red)
			.setTimestamp()
			.addField(member.guild.language.get('GUILD_LOG_REASON'), reason)
			.setFooter(member.guild.language.get('GUILD_LOG_GUILDMEMBERMUTE'));

		if (when) await embed.setFooter(member.guild.language.get('GUILD_LOG_GUILDMEMBERMUTE_TIMED', when));

		const logChannel = await this.client.channels.get(member.guild.settings.channels.log);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		// eslint-disable-next-line max-len
		if (member.guild.settings.moderation.notifyUser && !reason.includes('-s', reason.length - 2)) await member.send(member.guild.language.get('COMMAND_MODERATION_BOILERPLATE', member.guild), { disableEveryone: true, embed: embed });
		return;
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
