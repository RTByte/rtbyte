import { GuildLogEmbed } from '#lib/extensions/GuildLogEmbed';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, type ListenerOptions } from '@sapphire/framework';
import { inlineCodeBlock, isNullish } from '@sapphire/utilities';
import { BaseGuildTextChannel, GuildMember } from 'discord.js';

@ApplyOptions<ListenerOptions>({ event: Events.GuildMemberAdd })
export class UserEvent extends Listener {
	public async run(member: GuildMember) {
		if (isNullish(member.id)) return;
		if (member.user.bot) return;

		const guildSettingsInfoLogs = await this.container.prisma.guildSettingsInfoLogs.findUnique({ where: { id: member.guild.id } });
		if (!guildSettingsInfoLogs?.guildMemberAddLog || !guildSettingsInfoLogs.infoLogChannel) return;

		const logChannel = member.guild.channels.resolve(guildSettingsInfoLogs.infoLogChannel) as BaseGuildTextChannel;

		return this.container.client.emit('guildLogCreate', logChannel, (await this.generateGuildLog(member)));
	}

	private generateGuildLog(member: GuildMember) {
		const embed = new GuildLogEmbed()
			.setAuthor({
				name: member.user.username,
				url: `https://discord.com/users/${member.user.id}`,
				iconURL: member.user.displayAvatarURL()
			})
			.setDescription(inlineCodeBlock(member.user.id))
			.addFields({ name: 'Registered', value: `<t:${Math.round(member?.user.createdTimestamp as number / 1000)}:R>`, inline: true })
			.setFooter({ text: 'User joined' })
			.setType(Events.GuildMemberAdd);
		// TODO Track previous times users have joined/left server
		// TODO Track previous usernames/nicknames users have had while on this server
		return [embed]
	}
}
