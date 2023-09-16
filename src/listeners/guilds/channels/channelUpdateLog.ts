import { GuildLogEmbed } from '#lib/extensions/GuildLogEmbed';
import { minutes, seconds } from '#utils/common/times';
import { Emojis } from '#utils/constants';
import { getAuditLogExecutor, getRegionOverride } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, type ListenerOptions } from '@sapphire/framework';
import { DurationFormatter } from '@sapphire/time-utilities';
import { codeBlock, inlineCodeBlock, isNullish } from '@sapphire/utilities';
import { AuditLogEvent, BaseGuildTextChannel, CategoryChannel, ChannelType, ForumChannel, NewsChannel, StageChannel, TextChannel, User, VoiceChannel } from 'discord.js';

type GuildBasedChannel = CategoryChannel | NewsChannel | StageChannel | TextChannel | VoiceChannel | ForumChannel

@ApplyOptions<ListenerOptions>({ event: Events.ChannelUpdate })
export class UserEvent extends Listener {
	public async run(oldChannel: GuildBasedChannel, channel: GuildBasedChannel) {
		if (isNullish(channel.id)) return;

		const guildSettingsInfoLogs = await this.container.prisma.guildSettingsInfoLogs.findUnique({ where: { id: channel.guild.id } });
		if (!guildSettingsInfoLogs?.channelUpdateLog || !guildSettingsInfoLogs.infoLogChannel) return;

		const logChannel = channel.guild.channels.resolve(guildSettingsInfoLogs.infoLogChannel) as BaseGuildTextChannel;
		const executor = await getAuditLogExecutor(AuditLogEvent.ChannelUpdate, channel.guild);

		return this.container.client.emit('guildLogCreate', logChannel, this.generateGuildLog(oldChannel, channel, executor));
	}

	private generateGuildLog(oldChannel: GuildBasedChannel, channel: GuildBasedChannel, executor: User | null | undefined) {
		const embed = new GuildLogEmbed()
			.setAuthor({
				name: `${channel.name}`,
				url: `https://discord.com/channels/${channel.guildId}/${channel.id}`,
				iconURL: channel.guild.iconURL() ?? undefined
			})
			.setDescription(inlineCodeBlock(channel.id))
			.setFooter({ text: `Channel updated ${isNullish(executor) ? '' : `by ${executor.username}`}`, iconURL: isNullish(executor) ? undefined : executor?.displayAvatarURL() })
			.setType(Events.ChannelUpdate);

		if (channel.parent) embed.addFields({ name: 'Category', value: inlineCodeBlock(channel.parent.name), inline: true });

		const changes = [];
		let footerChannelType;

		if (oldChannel.name !== channel.name) changes.push(`${Emojis.Bullet}**Name**: ${inlineCodeBlock(`${oldChannel.name}`)} to ${inlineCodeBlock(`${channel.name}`)}`);
		if (oldChannel.parent !== channel.parent) changes.push(`${Emojis.Bullet}**Category**: ${inlineCodeBlock(`${oldChannel.parent}`)} to ${inlineCodeBlock(`${channel.parent}`)}`);
		if (oldChannel.type !== channel.type) changes.push(`${Emojis.Bullet}**Announcement channel**: ${channel.type === ChannelType.GuildAnnouncement ? Emojis.ToggleOn : Emojis.ToggleOff}`);

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

		if (oldChannel.type === ChannelType.GuildForum && channel.type === ChannelType.GuildForum) {
			const forumLayout = ['Not set', 'List view', 'Gallery view'];
			const sortOrder = ['Recent activity', 'Creation time'];
			if (oldChannel.defaultReactionEmoji?.id !== channel.defaultReactionEmoji?.id) changes.push(`${Emojis.Bullet}**Default reaction**: ${oldChannel.defaultReactionEmoji ? channel.guild.emojis.resolve(oldChannel.defaultReactionEmoji.id as string) ?? oldChannel.defaultReactionEmoji.name : inlineCodeBlock('Not set')} to ${channel.defaultReactionEmoji ? channel.guild.emojis.resolve(channel.defaultReactionEmoji.id as string) ?? channel.defaultReactionEmoji.name : inlineCodeBlock('Not set')}`);
			if (oldChannel.rateLimitPerUser !== channel.rateLimitPerUser) changes.push(`${Emojis.Bullet}**Posts slowmode**: ${inlineCodeBlock(`${oldChannel.rateLimitPerUser ? new DurationFormatter().format(seconds(oldChannel.rateLimitPerUser)) : 'Off'}`)} to ${inlineCodeBlock(`${channel.rateLimitPerUser ? new DurationFormatter().format(seconds(channel.rateLimitPerUser)) : 'Off'}`)}`);
			if (oldChannel.defaultThreadRateLimitPerUser !== channel.defaultThreadRateLimitPerUser) changes.push(`${Emojis.Bullet}**Messages slowmode**: ${inlineCodeBlock(`${oldChannel.defaultThreadRateLimitPerUser ? new DurationFormatter().format(seconds(oldChannel.defaultThreadRateLimitPerUser)) : 'Off'}`)} to ${inlineCodeBlock(`${channel.defaultThreadRateLimitPerUser ? new DurationFormatter().format(seconds(channel.defaultThreadRateLimitPerUser)) : 'Off'}`)}`);
			if (oldChannel.defaultForumLayout !== channel.defaultForumLayout) changes.push(`${Emojis.Bullet}**Default layout**: ${inlineCodeBlock(`${forumLayout[oldChannel.defaultForumLayout]}`)} to ${inlineCodeBlock(`${forumLayout[channel.defaultForumLayout]}`)}`);
			if (oldChannel.defaultSortOrder && oldChannel.defaultSortOrder !== channel.defaultSortOrder) changes.push(`${Emojis.Bullet}**Sort order**: ${inlineCodeBlock(`${sortOrder[oldChannel.defaultSortOrder]}`)} to ${inlineCodeBlock(`${sortOrder[channel.defaultSortOrder!]}`)}`);
			if (oldChannel.nsfw !== channel.nsfw) changes.push(`${Emojis.Bullet}**Age-restricted**: ${channel.nsfw ? Emojis.ToggleOn : Emojis.ToggleOff}`);
			if (oldChannel.defaultAutoArchiveDuration !== channel.defaultAutoArchiveDuration) changes.push(`${Emojis.Bullet}**Hide after inactivity**: ${inlineCodeBlock(`${new DurationFormatter().format(minutes(oldChannel.defaultAutoArchiveDuration ?? 4320))}`)} to ${inlineCodeBlock(`${new DurationFormatter().format(minutes(channel.defaultAutoArchiveDuration ?? 4320))}`)}`);
			if (oldChannel.topic && oldChannel.topic !== channel.topic) changes.push(`${Emojis.Bullet}**Post guidelines**:\n${oldChannel.topic ? codeBlock(`${oldChannel.topic}`) : codeBlock('Not set')}to\n${channel.topic ? codeBlock(`${channel.topic}`) : codeBlock('Not set')}`);
		}

		const videoQualityMode = ['', 'Auto', '720p'];
		if (oldChannel.type === ChannelType.GuildStageVoice && channel.type === ChannelType.GuildStageVoice) {
			if (oldChannel.bitrate !== channel.bitrate) changes.push(`${Emojis.Bullet}**Bitrate**: ${inlineCodeBlock(`${oldChannel.bitrate / 1000}kbps`)} to ${inlineCodeBlock(`${channel.bitrate / 1000}kbps`)}`);
			if (oldChannel.rateLimitPerUser !== channel.rateLimitPerUser) changes.push(`${Emojis.Bullet}**Slowmode**: ${inlineCodeBlock(`${oldChannel.rateLimitPerUser ? new DurationFormatter().format(seconds(oldChannel.rateLimitPerUser)) : 'Off'}`)} to ${inlineCodeBlock(`${channel.rateLimitPerUser ? new DurationFormatter().format(seconds(channel.rateLimitPerUser)) : 'Off'}`)}`);
			if (oldChannel.nsfw !== channel.nsfw) changes.push(`${Emojis.Bullet}**Age-restricted**: ${channel.nsfw ? Emojis.ToggleOn : Emojis.ToggleOff}`);
			if (oldChannel.videoQualityMode && oldChannel.videoQualityMode !== channel.videoQualityMode) changes.push(`${Emojis.Bullet}**Video quality**: ${inlineCodeBlock(`${videoQualityMode[oldChannel.videoQualityMode]}`)} to ${inlineCodeBlock(`${videoQualityMode[channel.videoQualityMode!]}`)}`);
			if (oldChannel.userLimit !== channel.userLimit) changes.push(`${Emojis.Bullet}**User limit**: ${inlineCodeBlock(`${oldChannel.userLimit}`)} to ${inlineCodeBlock(`${channel.userLimit}`)}`);
			if (oldChannel.rtcRegion !== channel.rtcRegion) changes.push(`${Emojis.Bullet}**Region override**: ${getRegionOverride(oldChannel)} to ${getRegionOverride(channel)}`);
		}

		if (oldChannel.type === ChannelType.GuildText && channel.type === ChannelType.GuildText) {
			if (oldChannel.rateLimitPerUser !== channel.rateLimitPerUser) changes.push(`${Emojis.Bullet}**Slowmode**: ${inlineCodeBlock(`${oldChannel.rateLimitPerUser ? new DurationFormatter().format(seconds(oldChannel.rateLimitPerUser)) : 'Off'}`)} to ${inlineCodeBlock(`${channel.rateLimitPerUser ? new DurationFormatter().format(seconds(channel.rateLimitPerUser)) : 'Off'}`)}`);
			if (oldChannel.nsfw !== channel.nsfw) changes.push(`${Emojis.Bullet}**Age-restricted**: ${channel.nsfw ? Emojis.ToggleOn : Emojis.ToggleOff}`);
			if (oldChannel.defaultAutoArchiveDuration !== channel.defaultAutoArchiveDuration) changes.push(`${Emojis.Bullet}**Hide after inactivity**: ${inlineCodeBlock(`${new DurationFormatter().format(minutes(oldChannel.defaultAutoArchiveDuration ?? 4320))}`)} to ${inlineCodeBlock(`${new DurationFormatter().format(minutes(channel.defaultAutoArchiveDuration ?? 4320))}`)}`);
			if (oldChannel.topic && oldChannel.topic !== channel.topic) changes.push(`${Emojis.Bullet}**Topic**:\n${oldChannel.topic ? codeBlock(`${oldChannel.topic}`) : codeBlock('Not set')}to\n${channel.topic ? codeBlock(`${channel.topic}`) : codeBlock('Not set')}`);
		}

		if (oldChannel.type === ChannelType.GuildVoice && channel.type === ChannelType.GuildVoice) {
			if (oldChannel.rateLimitPerUser !== channel.rateLimitPerUser) changes.push(`${Emojis.Bullet}**Slowmode**: ${inlineCodeBlock(`${oldChannel.rateLimitPerUser ? new DurationFormatter().format(seconds(oldChannel.rateLimitPerUser)) : 'Off'}`)} to ${inlineCodeBlock(`${channel.rateLimitPerUser ? new DurationFormatter().format(seconds(channel.rateLimitPerUser)) : 'Off'}`)}`);
			if (oldChannel.nsfw !== channel.nsfw) changes.push(`${Emojis.Bullet}**Age-restricted**: ${channel.nsfw ? Emojis.ToggleOn : Emojis.ToggleOff}`);
			if (oldChannel.bitrate !== channel.bitrate) changes.push(`${Emojis.Bullet}**Bitrate**: ${inlineCodeBlock(`${oldChannel.bitrate / 1000}kbps`)} to ${inlineCodeBlock(`${channel.bitrate / 1000}kbps`)}`);
			if (oldChannel.videoQualityMode && oldChannel.videoQualityMode !== channel.videoQualityMode) changes.push(`${Emojis.Bullet}**Video quality**: ${inlineCodeBlock(`${videoQualityMode[oldChannel.videoQualityMode]}`)} to ${inlineCodeBlock(`${videoQualityMode[channel.videoQualityMode!]}`)}`);
			if (oldChannel.userLimit !== channel.userLimit) changes.push(`${Emojis.Bullet}**User limit**: ${inlineCodeBlock(`${oldChannel.userLimit}`)} to ${inlineCodeBlock(`${channel.userLimit}`)}`);
			if (oldChannel.rtcRegion !== channel.rtcRegion) changes.push(`${Emojis.Bullet}**Region override**: ${getRegionOverride(oldChannel)} to ${getRegionOverride(channel)}`);
		}

		if ((oldChannel.parent || channel.parent) && (oldChannel.permissionsLocked !== channel.permissionsLocked)) changes.push(`${Emojis.Bullet}**Permissions synced with category**: ${channel.permissionsLocked ? Emojis.Check : Emojis.X}`);
		if (oldChannel.permissionOverwrites.cache !== channel.permissionOverwrites.cache) {

		}

		if (changes.length) embed.addFields({ name: 'Changes', value: changes.join('\n') });
		embed.setFooter({ text: `${footerChannelType} updated ${isNullish(executor) ? '' : `by ${executor.username}`}`, iconURL: isNullish(executor) ? undefined : executor?.displayAvatarURL() });

		if (changes.length) return [embed];
		return [];
	}
}
