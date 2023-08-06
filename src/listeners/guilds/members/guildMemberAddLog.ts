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

		const dbGuildLogs = await this.container.prisma.guildLogs.findUnique({ where: { guildId: member.guild.id }});
		if (!dbGuildLogs?.logsEnabled || !dbGuildLogs.logChannel || !dbGuildLogs.members) return;

		const logChannel = member.guild.channels.resolve(dbGuildLogs.logChannel) as BaseGuildTextChannel;

		return this.container.client.emit('guildLogCreate', logChannel, (await this.generateGuildLog(member)));
	}

	private async generateGuildLog(member: GuildMember) {
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

		const dbMember = await this.container.prisma.member.findFirst({ where: { user: { id: member.user.id }}, include: { user: true } });
		const previousUsernames = dbMember?.user.previousUsernames.filter(name => name !== member.user.username).map(name => inlineCodeBlock(name)).join(' ');
		if (dbMember && dbMember?.timesJoined > 1) embed.addFields({ name: 'Times joined', value: inlineCodeBlock(`${dbMember.timesJoined}`), inline: true });
		if (dbMember && previousUsernames) embed.addFields({ name: 'Previous usernames', value: previousUsernames });

		return [embed]
	}
}
