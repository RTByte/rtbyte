import { GuildLogEmbed } from '#lib/extensions/GuildLogEmbed';
import { getAuditLogExecutor } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, type ListenerOptions } from '@sapphire/framework';
import { inlineCodeBlock, isNullish } from '@sapphire/utilities';
import { AuditLogEvent, BaseGuildTextChannel, ChannelType, GuildChannel, User } from 'discord.js';

@ApplyOptions<ListenerOptions>({ event: Events.ChannelDelete })
export class UserEvent extends Listener {
	public async run(channel: GuildChannel) {
		if (isNullish(channel.id)) return;

		const guildSettingsInfoLogs = await this.container.prisma.guildSettingsInfoLogs.findUnique({ where: { id: channel.guild.id } });
		if (!guildSettingsInfoLogs?.channelDeleteLog || !guildSettingsInfoLogs.infoLogChannel) return;

		const logChannel = channel.guild.channels.resolve(guildSettingsInfoLogs.infoLogChannel) as BaseGuildTextChannel;
		const executor = await getAuditLogExecutor(AuditLogEvent.ChannelDelete, channel.guild);

		return this.container.client.emit('guildLogCreate', logChannel, this.generateGuildLog(channel, executor));
	}

	private generateGuildLog(channel: GuildChannel, executor: User | null | undefined) {
		const embed = new GuildLogEmbed()
			.setAuthor({
				name: `${channel.name}`,
				iconURL: channel.guild.iconURL() ?? undefined
			})
			.setDescription(inlineCodeBlock(channel.id))
			.setFooter({ text: `Channel deleted ${isNullish(executor) ? '' : `by ${executor.username}`}`, iconURL: isNullish(executor) ? undefined : executor?.displayAvatarURL() })
			.setType(Events.ChannelDelete);

		if (channel.parent) embed.addFields({ name: 'Category', value: inlineCodeBlock(channel.parent.name), inline: true });
		if (channel?.createdTimestamp) embed.addFields({ name: 'Created', value: `<t:${Math.round(channel.createdTimestamp as number / 1000)}:R>`, inline: true });

		let footerChannelType;
		// eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
		switch (channel.type) {
			case ChannelType.GuildAnnouncement:
				footerChannelType = 'Announcement channel';
				break;
			case ChannelType.GuildCategory:
				footerChannelType = 'Category';
				break;
			case ChannelType.GuildForum:
				footerChannelType = 'Forum channel';
				break;
			case ChannelType.GuildStageVoice:
				footerChannelType = 'Stage channel';
				break;
			case ChannelType.GuildText:
				footerChannelType = 'Text channel';
				break;
			case ChannelType.GuildVoice:
				footerChannelType = 'Voice channel';
				break;
		}
		embed.setFooter({ text: `${footerChannelType} deleted ${isNullish(executor) ? '' : `by ${executor.username}`}`, iconURL: isNullish(executor) ? undefined : executor?.displayAvatarURL() });

		return [embed]
	}
}
