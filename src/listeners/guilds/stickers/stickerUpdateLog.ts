import { LanguageKeys } from "#lib/i18n/languageKeys";
import { GuildLogEmbed } from "#lib/structures";
import { Events } from "#lib/types/Enums";
import { getAuditLogExecutor } from "#utils/util";
import { ApplyOptions } from "@sapphire/decorators";
import { Listener, ListenerOptions } from "@sapphire/framework";
import { isNullish } from "@sapphire/utilities";
import { Guild, Sticker, User } from "discord.js";
import { TFunction } from "i18next";

@ApplyOptions<ListenerOptions>({ event: Events.StickerUpdate })
export class UserListener extends Listener {
	public async run(oldSticker: Sticker, sticker: Sticker) {
		if (isNullish(sticker.id)) return;

		const auditLogExecutor = await getAuditLogExecutor('STICKER_UPDATE', sticker.guild as Guild);
		const guildSettings = await this.container.client.prisma.guildSettings.findFirst({ where: { guildID: sticker.guild?.id } })
		const T = this.container.i18n.getT(guildSettings?.language as string)

		if (guildSettings?.logChannel && guildSettings.stickerUpdateLog) {
			this.container.client.emit(Events.GuildMessageLog, sticker.guild, guildSettings?.logChannel, Events.StickerUpdate, this.serverLog(oldSticker, sticker, auditLogExecutor, T));
		}
	}

	private serverLog(oldSticker: Sticker, sticker: Sticker, executor: User | null | undefined, t: TFunction) {
		const embed = new GuildLogEmbed()
			.setAuthor({
				name: sticker.name,
				url: sticker.url,
				iconURL: sticker.format === 'APNG' || sticker.format === 'PNG' ? sticker.url : undefined
			})
			.setDescription(t(LanguageKeys.Miscellaneous.DisplayID, { id: sticker.id }))
			.setFooter({
				text: t(LanguageKeys.Events.Guilds.Logs.StickerUpdated, { by: executor ? t(LanguageKeys.Miscellaneous.By, { user: executor?.tag }) : undefined }),
				iconURL: executor?.displayAvatarURL() ?? undefined
			})
			.setType(Events.StickerUpdate);

		// Set image field to sticker URL if it's an image file
		if (sticker.format === 'APNG' || sticker.format === 'PNG') embed.setImage(sticker.url);

		// Name changed
		if (oldSticker.name !== sticker.name) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.NameChanged), t(LanguageKeys.Events.Guilds.Logs.ChangeShortText, { before: oldSticker.name, after: sticker.name }));
		}

		// Related emoji changed
		if (oldSticker.tags?.toString() !== sticker.tags?.toString()) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.RelatedEmojiChanged), t(LanguageKeys.Events.Guilds.Logs.ChangeShortObject, {
				before: `:${oldSticker.tags?.toString()}:`, after: `:${sticker.tags?.toString()}:`
			}));
		}

		// Description changed
		if (oldSticker.description !== sticker.description) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.DescriptionChanged), t(LanguageKeys.Events.Guilds.Logs.ChangeShortText, { before: oldSticker.description, after: sticker.description }));
		}

		return embed;
	}
}
