import { LanguageKeys } from "#lib/i18n/languageKeys";
import { GuildLogEmbed } from "#lib/structures";
import { Events } from "#lib/types/Enums";
import { getAuditLogExecutor } from "#utils/util";
import { ApplyOptions } from "@sapphire/decorators";
import { Events as SapphireEvents, Listener, ListenerOptions } from "@sapphire/framework";
import { isNullish } from "@sapphire/utilities";
import { GuildEmoji, User } from "discord.js";
import type { TFunction } from 'i18next';

@ApplyOptions<ListenerOptions>({ event: Events.EmojiUpdate })
export class UserListener extends Listener<typeof SapphireEvents.GuildEmojiUpdate> {
	public async run(oldEmoji: GuildEmoji, emoji: GuildEmoji) {
		if (isNullish(emoji.id)) return;

		const auditLogExecutor = await getAuditLogExecutor('EMOJI_UPDATE', emoji.guild);
		const guildSettings = await this.container.client.prisma.guildSettings.findFirst({ where: { guildID: emoji.guild.id } })
		const T = this.container.i18n.getT(guildSettings?.language as string)

		if (guildSettings?.logChannel && guildSettings.emojiUpdateLog) {
			this.container.client.emit(Events.GuildMessageLog, emoji.guild, guildSettings?.logChannel, Events.EmojiUpdate, this.serverLog(oldEmoji, emoji, auditLogExecutor, T));
		}
	}

	private serverLog(oldEmoji: GuildEmoji, emoji: GuildEmoji, executor: User | null | undefined, t: TFunction) {
		const embed = new GuildLogEmbed()
			.setAuthor({
				name: `:${emoji.name}:`,
				url: emoji.url,
				iconURL: emoji.url
			})
			.setDescription(t(LanguageKeys.Miscellaneous.DisplayID, { id: emoji.id }))
			.setThumbnail(emoji.url)
			.setFooter({
				text: t(LanguageKeys.Events.Guilds.Logs.EmojiUpdated, { by: executor ? t(LanguageKeys.Miscellaneous.By, { user: executor?.tag }) : undefined }),
				iconURL: executor?.displayAvatarURL() ?? undefined
			})
			.setType(Events.EmojiUpdate);

		// Name changed
		if (oldEmoji.name !== emoji.name) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.NameChanged), t(LanguageKeys.Events.Guilds.Logs.ChangeShortText, { before: oldEmoji.name, after: emoji.name }));
		}

		if (!embed.fields.length) return;

		return embed;
	}
}
