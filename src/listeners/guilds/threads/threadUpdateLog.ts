import { LanguageKeys } from "#lib/i18n/languageKeys";
import { GuildLogEmbed } from "#lib/structures";
import { Events } from "#lib/types/Enums";
import { seconds } from "#utils/common";
import { Emojis } from "#utils/constants";
import { getAuditLogExecutor } from "#utils/util";
import { ApplyOptions } from "@sapphire/decorators";
import { Listener, ListenerOptions } from "@sapphire/framework";
import { isNullish } from "@sapphire/utilities";
import { ThreadChannel, User } from "discord.js";
import type { TFunction } from 'i18next';

@ApplyOptions<ListenerOptions>({ event: Events.ThreadUpdate })
export class UserListener extends Listener {
	public async run(oldThread: ThreadChannel, thread: ThreadChannel) {
		if (isNullish(thread.id)) return;

		const auditLogExecutor = await getAuditLogExecutor('THREAD_UPDATE', thread.guild);
		const guildSettings = await this.container.client.prisma.guildSettings.findFirst({ where: { guildID: thread.guild.id } })
		const T = this.container.i18n.getT(guildSettings?.language as string)

		if (guildSettings?.logChannel && guildSettings.threadUpdateLog) {
			this.container.client.emit(Events.GuildMessageLog, thread.guild, guildSettings?.logChannel, Events.ThreadUpdate, this.serverLog(oldThread, thread, auditLogExecutor, T));
		}
	}

	private serverLog(oldThread: ThreadChannel, thread: ThreadChannel, executor: User | null | undefined, t: TFunction) {
		const embed = new GuildLogEmbed()
			.setAuthor(thread.name, thread.guild.iconURL() as string)
			.setDescription(t(LanguageKeys.Miscellaneous.DisplayID, { id: thread.id }))
			.setFooter(t(LanguageKeys.Events.Guilds.Logs.ThreadUpdated, { by: executor ? t(LanguageKeys.Miscellaneous.By, { user: executor?.tag }) : undefined }), executor?.displayAvatarURL() ?? undefined)
			.setType(Events.ThreadUpdate);

		// Set channel field depending on parent channel type
		switch (thread.parent?.type) {
			case 'GUILD_NEWS':
				embed.addField(t(LanguageKeys.Miscellaneous.NewsChannel), `<#${thread.parent.id}>`);
				break;
			default:
				embed.addField(t(LanguageKeys.Miscellaneous.Channel), `<#${thread.parent?.id}>`);
		}

		// Return immediately if thread is archived or unarchived
		if (oldThread.archived !== thread.archived) {
			if (thread.archived) embed.setFooter(t(LanguageKeys.Events.Guilds.Logs.ThreadArchived, { by: executor ? t(LanguageKeys.Miscellaneous.By, { user: executor?.tag }) : undefined }), executor?.displayAvatarURL() ?? undefined)
			if (!thread.archived) embed.setFooter(t(LanguageKeys.Events.Guilds.Logs.ThreadUnarchived, { by: executor ? t(LanguageKeys.Miscellaneous.By, { user: executor?.tag }) : undefined }), executor?.displayAvatarURL() ?? undefined)

			return embed;
		}

		// Name changed
		if (oldThread.name !== thread.name) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.NameChanged), t(LanguageKeys.Events.Guilds.Logs.ChangeShortText, {
				before: oldThread.name, after: thread.name
			}));
		}

		// Slowmode interval changed
		if (oldThread.rateLimitPerUser !== thread.rateLimitPerUser) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SlowmodeChanged), t(LanguageKeys.Events.Guilds.Logs.ChangeShortText, {
				before: t(LanguageKeys.Globals.DurationValue, { value: seconds(oldThread.rateLimitPerUser || 0) }), after: t(LanguageKeys.Globals.DurationValue, { value: seconds(thread.rateLimitPerUser || 0) })
			}));
		}

		// Anyone can unarchive toggled
		if (oldThread.locked !== thread.locked) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.AnyoneCanUnarchive), thread.locked ? Emojis.X : Emojis.Check);
		}

		if (embed.fields.length === 1 && (embed.fields[0].name === t(LanguageKeys.Miscellaneous.NewsChannel) || embed.fields[0].name === t(LanguageKeys.Miscellaneous.Channel))) {
			return;
		}

		return embed;
	}
}
