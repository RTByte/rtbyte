import { GuildLogEmbed } from '#lib/extensions/GuildLogEmbed';
import { getAuditLogExecutor } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, type ListenerOptions } from '@sapphire/framework';
import { inlineCodeBlock, isNullish } from '@sapphire/utilities';
import { AuditLogEvent, BaseGuildTextChannel, ChannelType, Guild, GuildScheduledEvent, User } from 'discord.js';

@ApplyOptions<ListenerOptions>({ event: Events.GuildScheduledEventCreate })
export class UserEvent extends Listener {
	public async run(event: GuildScheduledEvent) {
		if (isNullish(event.id)) return;

		const dbGuildLogs = await this.container.prisma.guildLogs.findUnique({ where: { guildId: event.guild?.id }});
		if (!dbGuildLogs?.logsEnabled || !dbGuildLogs.logChannel || !dbGuildLogs.events) return;

		const logChannel = event.guild?.channels.resolve(dbGuildLogs.logChannel) as BaseGuildTextChannel;
		const executor = await getAuditLogExecutor(AuditLogEvent.GuildScheduledEventCreate, event.guild as Guild);

		return this.container.client.emit('guildLogCreate', logChannel, this.generateGuildLog(event, executor));
	}

	private generateGuildLog(event: GuildScheduledEvent, executor: User | null | undefined) {
		const embed = new GuildLogEmbed()
			.setAuthor({
				name: event.name,
				url: event.url,
				iconURL: event.guild?.iconURL() ?? undefined
			})
			.setDescription(`${inlineCodeBlock(event.id)}\n**Description**:\n${event.description}`)
			.setFooter({ text: `Event created ${isNullish(executor) ? '' : `by ${executor.username}`}`, iconURL: isNullish(executor) ? undefined : executor?.displayAvatarURL() })
			.setType(Events.GuildScheduledEventCreate);

		if (event.channel) embed.addFields({ name: event.channel.type === ChannelType.GuildVoice ? 'Voice channel' : 'Stage channel', value: `<#${event.channelId}>`, inline: true });
		if (event.entityMetadata?.location) embed.addFields({ name: 'Location', value: event.entityMetadata.location });
		if (event.scheduledStartTimestamp) embed.addFields({ name: 'Scheduled to start', value: `<t:${Math.round(event.scheduledStartTimestamp as number / 1000)}:R>`, inline: true });
		if (event.scheduledEndTimestamp) embed.addFields({ name: 'Scheduled to end', value: `<t:${Math.round(event.scheduledEndTimestamp as number / 1000)}:R>`, inline: true });
		if (event.image) embed.setImage(event.coverImageURL())

		return [embed]
	}
}
