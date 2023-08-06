import { GuildLogEmbed } from '#lib/extensions/GuildLogEmbed';
import { getAuditLogExecutor } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, type ListenerOptions } from '@sapphire/framework';
import { inlineCodeBlock, isNullish } from '@sapphire/utilities';
import { AuditLogEvent, BaseGuildTextChannel, ChannelType, ThreadChannel, User } from 'discord.js';

@ApplyOptions<ListenerOptions>({ event: Events.ThreadDelete })
export class UserEvent extends Listener {
	public async run(thread: ThreadChannel) {
		if (isNullish(thread.id)) return;

		const dbGuildLogs = await this.container.prisma.guildLogs.findUnique({ where: { guildId: thread.guild.id }});
		if (!dbGuildLogs?.logsEnabled || !dbGuildLogs.logChannel || !dbGuildLogs.threads) return;

		const logChannel = thread.guild.channels.resolve(dbGuildLogs.logChannel) as BaseGuildTextChannel;
		const executor = await getAuditLogExecutor(AuditLogEvent.ThreadDelete, thread.guild);
		const isForumThread = thread.parent?.type === ChannelType.GuildForum;

		return this.container.client.emit('guildLogCreate', logChannel, this.generateGuildLog(thread, executor, isForumThread));
	}

	private generateGuildLog(thread: ThreadChannel, executor: User | null | undefined, isForumThread: boolean) {
		const postOrThread = isForumThread ? 'Post' : 'Thread';
		const embed = new GuildLogEmbed()
			.setAuthor({
				name: thread.name,
				url: `https://discord.com/channels/${thread.guildId}/${thread.id}`,
				iconURL: thread.guild.iconURL() ?? undefined
			})
			.setDescription(inlineCodeBlock(thread.id))
			.setFooter({ text: `${postOrThread} deleted ${isNullish(executor) ? '' : `by ${executor.username}`}`, iconURL: isNullish(executor) ? undefined : executor?.displayAvatarURL() })
			.setType(Events.ThreadDelete);

		if (thread.parent) embed.addFields({ name: `${thread.parent.type === ChannelType.GuildAnnouncement ? 'Announcement' : 'Text'} channel`, value: `<#${thread.parentId}>`, inline: true });
		if (thread.ownerId) embed.addFields({ name: 'Started by', value: `<@${thread.ownerId}>`, inline: true });
		if (thread.totalMessageSent) embed.addFields({ name: 'Total messages', value: inlineCodeBlock(`${thread.totalMessageSent}`), inline: true });
		if (thread?.createdTimestamp) embed.addFields({ name: 'Created', value: `<t:${Math.round(thread.createdTimestamp as number / 1000)}:R>`, inline: true });
		if (thread.appliedTags.length && thread.parent?.type === ChannelType.GuildForum) {
			const appliedTags = thread.parent.availableTags.filter(tag => thread.appliedTags.includes(tag.id)).map(tag => `${tag.emoji ? `${thread.guild.emojis.resolve(tag.emoji.id as string)} ` ?? `${tag.emoji.name} ` : ''}${inlineCodeBlock(tag.name)}`).join(' ');
			embed.addFields({ name: 'Applied tags', value: appliedTags });
		}
		
		return [embed]
	}
}
