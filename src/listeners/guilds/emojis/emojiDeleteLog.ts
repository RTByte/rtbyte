import { LanguageKeys } from "#lib/i18n/languageKeys";
import { GuildLogEmbed } from "#lib/structures";
import { Events } from "#lib/types/Enums";
import { getAuditLogExecutor } from "#utils/util";
import { ApplyOptions } from "@sapphire/decorators";
import { Events as SapphireEvents, Listener, ListenerOptions } from "@sapphire/framework";
import { isNullish } from "@sapphire/utilities";
import { GuildEmoji, User } from "discord.js";
import type { TFunction } from 'i18next';

@ApplyOptions<ListenerOptions>({ event: Events.EmojiDelete })
export class UserListener extends Listener<typeof SapphireEvents.GuildEmojiDelete> {
	public async run(emoji: GuildEmoji) {
		if (isNullish(emoji.id)) return;

		const auditLogExecutor = await getAuditLogExecutor('EMOJI_DELETE', emoji.guild);
		const guildSettings = await this.container.client.prisma.guildSettings.findFirst({ where: { guildID: emoji.guild.id } })
		const T = this.container.i18n.getT(guildSettings?.language as string)

		if (guildSettings?.logChannel && guildSettings.emojiDeleteLog) {
			this.container.client.emit(Events.GuildMessageLog, emoji.guild, guildSettings?.logChannel, Events.EmojiDelete, this.serverLog(emoji, auditLogExecutor, T));
		}
	}

	private serverLog(emoji: GuildEmoji, executor: User | null | undefined, t: TFunction) {
		const embed = new GuildLogEmbed()
			.setAuthor(`:${emoji.name}:`, emoji.url)
			.setDescription(t(LanguageKeys.Miscellaneous.DisplayID, { id: emoji.id }))
			.setThumbnail(emoji.url)
			.setFooter(t(LanguageKeys.Events.Guilds.Logs.EmojiDeleted, { by: executor ? t(LanguageKeys.Miscellaneous.By, { user: executor?.tag }) : undefined }), executor?.displayAvatarURL() ?? undefined)
			.setType(Events.EmojiDelete);

		return embed;
	}
}
