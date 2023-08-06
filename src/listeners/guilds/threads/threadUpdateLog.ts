import { GuildLogEmbed } from '#lib/extensions/GuildLogEmbed';
import { minutes, seconds } from '#utils/common/times';
import { Emojis } from '#utils/constants';
import { getAuditLogExecutor } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, type ListenerOptions } from '@sapphire/framework';
import { DurationFormatter } from '@sapphire/time-utilities';
import { inlineCodeBlock, isNullish } from '@sapphire/utilities';
import { AuditLogEvent, BaseGuildTextChannel, ChannelType, ForumChannel, ThreadChannel, User } from 'discord.js';

@ApplyOptions<ListenerOptions>({ event: Events.ThreadUpdate })
export class UserEvent extends Listener {
	public async run(oldThread: ThreadChannel, thread: ThreadChannel) {
		if (isNullish(thread.id)) return;

		const dbGuildLogs = await this.container.prisma.guildLogs.findUnique({ where: { guildId: thread.guild.id }});
		if (!dbGuildLogs?.logsEnabled || !dbGuildLogs.logChannel || !dbGuildLogs.threads) return;

		const logChannel = thread.guild.channels.resolve(dbGuildLogs.logChannel) as BaseGuildTextChannel;
		const executor = await getAuditLogExecutor(AuditLogEvent.ThreadUpdate, thread.guild);
		const isForumThread = thread.parent?.type === ChannelType.GuildForum;

		return this.container.client.emit('guildLogCreate', logChannel, this.generateGuildLog(oldThread, thread, executor, isForumThread));
	}

	private generateGuildLog(oldThread: ThreadChannel, thread: ThreadChannel, executor: User | null | undefined, isForumThread: boolean) {
		const postOrThread = isForumThread ? 'Post' : 'Thread';
		const embed = new GuildLogEmbed()
			.setAuthor({
				name: thread.name,
				url: `https://discord.com/channels/${thread.guildId}/${thread.id}`,
				iconURL: thread.guild.iconURL() ?? undefined
			})
			.setDescription(inlineCodeBlock(thread.id))
			.setFooter({ text: `${postOrThread} edited ${isNullish(executor) ? '' : `by ${executor.username}`}`, iconURL: isNullish(executor) ? undefined : executor?.displayAvatarURL() })
			.setType(Events.ThreadUpdate);

			if (thread.parent) embed.addFields({ name: `${thread.parent.type === ChannelType.GuildAnnouncement ? 'Announcement' : 'Text'} channel`, value: `<#${thread.parentId}>`, inline: true });
			if (thread.ownerId) embed.addFields({ name: 'Started by', value: `<@${thread.ownerId}>`, inline: true });
			
			const changes = [];
			if (oldThread.name !== thread.name) changes.push(`${Emojis.Bullet}**Name**: ${inlineCodeBlock(`${oldThread.name}`)} to ${inlineCodeBlock(`${thread.name}`)}`);
			if (oldThread.rateLimitPerUser !== thread.rateLimitPerUser) changes.push(`${Emojis.Bullet}**Slowmode**: ${inlineCodeBlock(`${oldThread.rateLimitPerUser ? new DurationFormatter().format(seconds(oldThread.rateLimitPerUser)) : 'Off'}`)} to ${inlineCodeBlock(`${thread.rateLimitPerUser ? new DurationFormatter().format(seconds(thread.rateLimitPerUser) ) : 'Off'}`)}`);
			if (oldThread.autoArchiveDuration !== thread.autoArchiveDuration) changes.push(`${Emojis.Bullet}**Hide after inactivity**: ${inlineCodeBlock(`${new DurationFormatter().format(minutes(oldThread.autoArchiveDuration ?? 4320))}`)} to ${inlineCodeBlock(`${new DurationFormatter().format(minutes(thread.autoArchiveDuration ?? 4320))}`)}`);
			if (thread.parent?.type === ChannelType.GuildForum && oldThread.appliedTags !== thread.appliedTags) {
				const tagDifference = this.getTagDifference(thread.parent, oldThread.appliedTags, thread.appliedTags);
				if (tagDifference.added.length) changes.push(`${Emojis.Bullet}**Tags added**: ${tagDifference.added.join(', ')}`);
				if (tagDifference.removed.length) changes.push(`${Emojis.Bullet}**Tags removed**: ${tagDifference.removed.join(', ')}`);
			}
			if (changes.length) embed.addFields({ name: 'Changes', value: changes.join('\n') });

		return [embed];
	}

	private getTagDifference(forumChannel: ForumChannel, oldTag: string[], tag: string[]) {
		const oldTags = forumChannel.availableTags.filter(t => oldTag.includes(t.id));
		const tags = forumChannel.availableTags.filter(t => tag.includes(t.id));
		const added = tags.filter(t => !oldTags.includes(t)).map(t => `${t.emoji ? forumChannel.guild.emojis.resolve(t.emoji.id as string) ?? t.emoji.name : ''} ${inlineCodeBlock(t.name)}`);
		const removed = oldTags.filter(t => !tags.includes(t)).map(t => `${t.emoji ? forumChannel.guild.emojis.resolve(t.emoji.id as string) ?? t.emoji.name : ''} ${inlineCodeBlock(t.name)}`);

		const differences = {
			added,
			removed
		}
	
		return differences;
	}
}
