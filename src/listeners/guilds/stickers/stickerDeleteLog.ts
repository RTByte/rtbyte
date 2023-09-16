import { GuildLogEmbed } from '#lib/extensions/GuildLogEmbed';
import { getAuditLogExecutor } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, type ListenerOptions } from '@sapphire/framework';
import { inlineCodeBlock, isNullish } from '@sapphire/utilities';
import { AuditLogEvent, BaseGuildTextChannel, Guild, Sticker, StickerFormatType, User } from 'discord.js';

@ApplyOptions<ListenerOptions>({ event: Events.GuildStickerDelete })
export class UserEvent extends Listener {
	public async run(sticker: Sticker) {
		if (isNullish(sticker.id)) return;

		const guildSettingsInfoLogs = await this.container.prisma.guildSettingsInfoLogs.findUnique({ where: { id: sticker.guild?.id } });
		if (!guildSettingsInfoLogs?.stickerDeleteLog || !guildSettingsInfoLogs.infoLogChannel) return;

		const logChannel = sticker.guild?.channels.resolve(guildSettingsInfoLogs.infoLogChannel) as BaseGuildTextChannel;
		const executor = await getAuditLogExecutor(AuditLogEvent.EmojiCreate, sticker.guild as Guild);

		return this.container.client.emit('guildLogCreate', logChannel, this.generateGuildLog(sticker, executor));
	}

	private generateGuildLog(sticker: Sticker, executor: User | null | undefined) {
		const embed = new GuildLogEmbed()
			.setAuthor({
				name: sticker.name,
				url: sticker.url,
				iconURL: sticker.url
			})
			.setDescription(inlineCodeBlock(sticker.id))
			.setThumbnail(sticker.url)
			.addFields({ name: 'Format', value: inlineCodeBlock(StickerFormatType[sticker.format]), inline: true })
			.setFooter({ text: `Sticker deleted ${isNullish(executor) ? '' : `by ${executor.username}`}`, iconURL: isNullish(executor) ? undefined : executor?.displayAvatarURL() })
			.setType(Events.GuildStickerDelete);

		if (sticker.tags) embed.addFields({ name: 'Emoji', value: `:${sticker.tags}:`, inline: true });
		if (sticker?.createdTimestamp) embed.addFields({ name: 'Created', value: `<t:${Math.round(sticker.createdTimestamp as number / 1000)}:R>`, inline: true });

		return [embed]
	}
}
