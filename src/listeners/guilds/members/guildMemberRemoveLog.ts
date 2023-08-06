import { GuildLogEmbed } from '#lib/extensions/GuildLogEmbed';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, type ListenerOptions } from '@sapphire/framework';
import { inlineCodeBlock, isNullish } from '@sapphire/utilities';
import { BaseGuildTextChannel, GuildMember } from 'discord.js';

@ApplyOptions<ListenerOptions>({ event: Events.GuildMemberRemove })
export class UserEvent extends Listener {
	public async run(member: GuildMember) {
		if (isNullish(member.id)) return;
		if (member.user.bot) return;

		const dbGuildLogs = await this.container.prisma.guildLogs.findUnique({ where: { guildId: member.guild.id }});
		if (!dbGuildLogs?.logsEnabled || !dbGuildLogs.logChannel || !dbGuildLogs.members) return;

		const logChannel = member.guild.channels.resolve(dbGuildLogs.logChannel) as BaseGuildTextChannel;

		return this.container.client.emit('guildLogCreate', logChannel, this.generateGuildLog(member));
	}

	private generateGuildLog(member: GuildMember) {
		const embed = new GuildLogEmbed()
			.setAuthor({
				name: member.user.username,
				url: `https://discord.com/users/${member.user.id}`,
				iconURL: member.user.displayAvatarURL()
			})
			.setDescription(inlineCodeBlock(member.user.id))
			.addFields({ name: 'Joined', value: `<t:${Math.round(member?.joinedTimestamp as number / 1000)}:R>`, inline: true})
			.setFooter({ text: 'User left' })
			.setType(Events.GuildMemberRemove);

		return [embed]
	}
}
