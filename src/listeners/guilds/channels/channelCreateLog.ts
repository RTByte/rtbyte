import { GuildLogEmbed } from '#lib/extensions/GuildLogEmbed';
import { getAuditLogExecutor } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, type ListenerOptions } from '@sapphire/framework';
import { inlineCodeBlock, isNullish } from '@sapphire/utilities';
import { AuditLogEvent, BaseGuildTextChannel, ChannelType, GuildChannel, User } from 'discord.js';

@ApplyOptions<ListenerOptions>({ event: Events.ChannelCreate })
export class UserEvent extends Listener {
	public async run(channel: GuildChannel) {
		if (isNullish(channel.id)) return;

		const dbGuildLogs = await this.container.prisma.guildLogs.findUnique({ where: { guildId: channel.guild.id }});
		if (!dbGuildLogs?.logsEnabled || !dbGuildLogs.logChannel || !dbGuildLogs.channels) return;

		const logChannel = channel.guild.channels.resolve(dbGuildLogs.logChannel) as BaseGuildTextChannel;
		const executor = await getAuditLogExecutor(AuditLogEvent.ChannelCreate, channel.guild);

		return this.container.client.emit('guildLogCreate', logChannel, this.generateGuildLog(channel, executor));
	}

	private generateGuildLog(channel: GuildChannel, executor: User | null | undefined) {
		const embed = new GuildLogEmbed()
			.setAuthor({
				name: `${channel.name}`,
				url: `https://discord.com/channels/${channel.guildId}/${channel.id}`,
				iconURL: channel.guild.iconURL() ?? undefined
			})
			.setDescription(inlineCodeBlock(channel.id))
			.setFooter({ text: `Channel created ${isNullish(executor) ? '' : `by ${executor.username}`}`, iconURL: isNullish(executor) ? undefined : executor?.displayAvatarURL() })
			.setType(Events.ChannelCreate);

		if (channel.parent) embed.addFields({ name: 'Category', value: inlineCodeBlock(channel.parent.name), inline: true });

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
		embed.setFooter({ text: `${footerChannelType} created ${isNullish(executor) ? '' : `by ${executor.username}`}`, iconURL: isNullish(executor) ? undefined : executor?.displayAvatarURL() });

		return [embed]
	}
}
