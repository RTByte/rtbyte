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

		const guildSettingsInfoLogs = await this.container.prisma.guildSettingsInfoLogs.findUnique({ where: { id: member.guild.id } });
		if (!guildSettingsInfoLogs?.guildMemberRemoveLog || !guildSettingsInfoLogs.infoLogChannel) return;

		const logChannel = member.guild.channels.resolve(guildSettingsInfoLogs.infoLogChannel) as BaseGuildTextChannel;

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
			.addFields({ name: 'Joined', value: `<t:${Math.round(member?.joinedTimestamp as number / 1000)}:R>`, inline: true })
			.setFooter({ text: 'User left' })
			.setType(Events.GuildMemberRemove);

		return [embed]
	}
}
