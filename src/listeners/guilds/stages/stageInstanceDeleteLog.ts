import { GuildLogEmbed } from '#lib/extensions/GuildLogEmbed';
import { getAuditLogExecutor } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, type ListenerOptions } from '@sapphire/framework';
import { cutText, inlineCodeBlock, isNullish } from '@sapphire/utilities';
import { AuditLogEvent, BaseGuildTextChannel, Guild, StageInstance, User } from 'discord.js';

@ApplyOptions<ListenerOptions>({ event: Events.StageInstanceDelete })
export class UserEvent extends Listener {
	public async run(stage: StageInstance) {
		if (isNullish(stage.id)) return;

		const dbGuildLogs = await this.container.prisma.guildLogs.findUnique({ where: { guildId: stage.guild?.id }});
		if (!dbGuildLogs?.logsEnabled || !dbGuildLogs.logChannel || !dbGuildLogs.stages) return;

		const logChannel = stage.guild?.channels.resolve(dbGuildLogs.logChannel) as BaseGuildTextChannel;
		const executor = await getAuditLogExecutor(AuditLogEvent.StageInstanceDelete, stage.guild as Guild);

		return this.container.client.emit('guildLogCreate', logChannel, this.generateGuildLog(stage, executor));
	}

	private generateGuildLog(stage: StageInstance, executor: User | null | undefined) {
		const embed = new GuildLogEmbed()
			.setAuthor({
				name: cutText(stage.topic, 256),
				url: `https://discord.com/channels/${stage.guildId}/${stage.channelId}`,
				iconURL: stage.guild?.iconURL() ?? undefined
			})
			.setDescription(inlineCodeBlock(stage.id))
			.addFields({ name: 'Stage channel', value: `<#${stage.channelId}>`, inline: true })
			.addFields({ name: 'Started', value: `<t:${Math.round(stage.createdTimestamp as number / 1000)}:R>`, inline: true })
			.setFooter({ text: `Stage ended ${isNullish(executor) ? '' : `by ${executor.username}`}`, iconURL: isNullish(executor) ? undefined : executor?.displayAvatarURL() })
			.setType(Events.StageInstanceDelete);

		if (stage.guildScheduledEvent) embed.addFields({ name: 'Associated event', value: `[${inlineCodeBlock(`${stage.guildScheduledEvent.name}`)}](${stage.guildScheduledEvent.url})` });

		return [embed];
	}
}
