import { GuildLogEmbed } from '#lib/extensions/GuildLogEmbed';
import { Emojis } from '#utils/constants';
import { getAuditLogExecutor } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, type ListenerOptions } from '@sapphire/framework';
import { codeBlock, inlineCodeBlock, isNullish } from '@sapphire/utilities';
import { AuditLogEvent, BaseGuildTextChannel, Guild, GuildScheduledEvent, User } from 'discord.js';

@ApplyOptions<ListenerOptions>({ event: Events.GuildScheduledEventUpdate })
export class UserEvent extends Listener {
	public async run(oldEvent: GuildScheduledEvent, event: GuildScheduledEvent) {
		if (isNullish(event.id)) return;

		const guildSettingsInfoLogs = await this.container.prisma.guildSettingsInfoLogs.findUnique({ where: { id: event.guild?.id } });
		if (!guildSettingsInfoLogs?.guildScheduledEventUpdateLog || !guildSettingsInfoLogs.infoLogChannel) return;

		const logChannel = event.guild?.channels.resolve(guildSettingsInfoLogs.infoLogChannel) as BaseGuildTextChannel;
		const executor = await getAuditLogExecutor(AuditLogEvent.GuildScheduledEventCreate, event.guild as Guild);

		return this.container.client.emit('guildLogCreate', logChannel, this.generateGuildLog(oldEvent, event, executor));
	}

	private generateGuildLog(oldEvent: GuildScheduledEvent, event: GuildScheduledEvent, executor: User | null | undefined) {
		const embed = new GuildLogEmbed()
			.setAuthor({
				name: event.name,
				url: event.url,
				iconURL: event.guild?.iconURL() ?? undefined
			})
			.setDescription(inlineCodeBlock(event.id))
			.setFooter({ text: `Event edited ${isNullish(executor) ? '' : `by ${executor.username}`}`, iconURL: isNullish(executor) ? undefined : executor?.displayAvatarURL() })
			.setType(Events.GuildScheduledEventUpdate);

		const changes = [];
		const oldEndTimestamp = oldEvent.scheduledEndTimestamp ? `<t:${Math.round(oldEvent.scheduledEndTimestamp as number / 1000)}:f>` : inlineCodeBlock('Not set');
		const endTimestamp = event.scheduledEndTimestamp ? `<t:${Math.round(event.scheduledEndTimestamp as number / 1000)}:f>` : inlineCodeBlock('Not set');
		if ((oldEvent.entityType !== event.entityType) || oldEvent.channel !== event.channel) {
			const oldEventLocation = oldEvent.entityMetadata?.location ? inlineCodeBlock(oldEvent.entityMetadata.location) : `<#${oldEvent.channelId}>`;
			const eventLocation = event.entityMetadata?.location ? inlineCodeBlock(event.entityMetadata.location) : `<#${event.channelId}>`;
			changes.push(`${Emojis.Bullet}**Location**: ${oldEventLocation} to ${eventLocation}`);
		}
		if (oldEvent.name !== event.name) changes.push(`${Emojis.Bullet}**Name**: ${inlineCodeBlock(`${oldEvent.name}`)} to ${inlineCodeBlock(`${event.name}`)}`);
		if (oldEvent.scheduledStartTimestamp !== event.scheduledStartTimestamp) changes.push(`${Emojis.Bullet}**Scheduled start**: <t:${Math.round(oldEvent.scheduledStartTimestamp as number / 1000)}:f> to <t:${Math.round(event.scheduledStartTimestamp as number / 1000)}:f>`);
		if (oldEvent.scheduledEndTimestamp !== event.scheduledEndTimestamp) changes.push(`${Emojis.Bullet}**Scheduled end**: ${oldEndTimestamp} to ${endTimestamp}`);
		if (oldEvent.image !== event.image) changes.push(`${Emojis.Bullet}**Cover image**: ${oldEvent.coverImageURL() ? `[${inlineCodeBlock('click to view')}](${oldEvent.coverImageURL()})` : inlineCodeBlock('Not set')} to ${event.coverImageURL() ? `[${inlineCodeBlock('click to view')}](${event.coverImageURL()})` : inlineCodeBlock('Not set')}`);
		if (oldEvent.description !== event.description) changes.push(`${Emojis.Bullet}**Description**:\n${oldEvent.description ? codeBlock(`${oldEvent.description}`) : codeBlock('Not set')}to\n${event.description ? codeBlock(`${event.description}`) : codeBlock('Not set')}`);
		if (changes.length) embed.addFields({ name: 'Changes', value: changes.join('\n') });

		return [embed]
	}
}
