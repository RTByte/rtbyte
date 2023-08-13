import { GuildLogEmbed } from '#lib/extensions/GuildLogEmbed';
import { getAuditLogExecutor } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, type ListenerOptions } from '@sapphire/framework';
import { inlineCodeBlock, isNullish } from '@sapphire/utilities';
import { AuditLogEvent, BaseGuildTextChannel, GuildEmoji, User } from 'discord.js';

@ApplyOptions<ListenerOptions>({ event: Events.GuildEmojiCreate })
export class UserEvent extends Listener {
	public async run(emoji: GuildEmoji) {
		if (isNullish(emoji.id)) return;

		const guildSettingsInfoLogs = await this.container.prisma.guildSettingsInfoLogs.findUnique({ where: { id: emoji.guild.id } });
		if (!guildSettingsInfoLogs?.emojiCreateLog || !guildSettingsInfoLogs.infoLogChannel) return;

		const logChannel = emoji.guild.channels.resolve(guildSettingsInfoLogs.infoLogChannel) as BaseGuildTextChannel;
		const executor = await getAuditLogExecutor(AuditLogEvent.EmojiCreate, emoji.guild);

		return this.container.client.emit('guildLogCreate', logChannel, this.generateGuildLog(emoji, executor));
	}

	private generateGuildLog(emoji: GuildEmoji, executor: User | null | undefined) {
		const embed = new GuildLogEmbed()
			.setAuthor({
				name: `:${emoji.name}:`,
				url: emoji.url,
				iconURL: emoji.url
			})
			.setDescription(inlineCodeBlock(emoji.id))
			.setThumbnail(emoji.url)
			.setFooter({ text: `Emoji created ${isNullish(executor) ? '' : `by ${executor.username}`}`, iconURL: isNullish(executor) ? undefined : executor?.displayAvatarURL() })
			.setType(Events.GuildEmojiCreate);

		return [embed]
	}
}
