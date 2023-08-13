import { GuildLogEmbed } from '#lib/extensions/GuildLogEmbed';
import { Emojis } from '#utils/constants';
import { getAuditLogExecutor } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, type ListenerOptions } from '@sapphire/framework';
import { inlineCodeBlock, isNullish } from '@sapphire/utilities';
import { AuditLogEvent, BaseGuildTextChannel, Guild, Sticker, User } from 'discord.js';

@ApplyOptions<ListenerOptions>({ event: Events.GuildStickerUpdate })
export class UserEvent extends Listener {
	public async run(oldSticker: Sticker, sticker: Sticker) {
		if (isNullish(sticker.id)) return;

		const guildSettingsInfoLogs = await this.container.prisma.guildSettingsInfoLogs.findUnique({ where: { id: sticker.guild?.id } });
		if (!guildSettingsInfoLogs?.stickerUpdateLog || !guildSettingsInfoLogs.infoLogChannel) return;

		const logChannel = sticker.guild?.channels.resolve(guildSettingsInfoLogs.infoLogChannel) as BaseGuildTextChannel;
		const executor = await getAuditLogExecutor(AuditLogEvent.EmojiCreate, sticker.guild as Guild);

		return this.container.client.emit('guildLogCreate', logChannel, this.generateGuildLog(oldSticker, sticker, executor));
	}

	private generateGuildLog(oldSticker: Sticker, sticker: Sticker, executor: User | null | undefined) {
		const embed = new GuildLogEmbed()
			.setAuthor({
				name: sticker.name,
				url: sticker.url,
				iconURL: sticker.url
			})
			.setDescription(inlineCodeBlock(sticker.id))
			.setThumbnail(sticker.url)
			.setFooter({ text: `Sticker updated ${isNullish(executor) ? '' : `by ${executor.username}`}`, iconURL: isNullish(executor) ? undefined : executor?.displayAvatarURL() })
			.setType(Events.GuildStickerUpdate);

		const changes = [];
		if (oldSticker.name !== sticker.name) changes.push(`${Emojis.Bullet}**Name changed**: ${inlineCodeBlock(`${oldSticker.name}`)} to ${inlineCodeBlock(`${sticker.name}`)}`);
		if (oldSticker.tags !== sticker.tags) changes.push(`${Emojis.Bullet}**Emoji changed**: :${oldSticker.tags}: to :${sticker.tags}:`);
		if (oldSticker.description !== sticker.description) changes.push(`${Emojis.Bullet}**Description changed**: ${inlineCodeBlock(`${oldSticker.description || 'Not set'}`)} to ${inlineCodeBlock(`${sticker.description || 'Not set'}`)}`);
		if (changes.length) embed.addFields({ name: 'Changes', value: changes.join('\n') });

		return [embed]
	}
}
