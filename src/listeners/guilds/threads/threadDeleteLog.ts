import { LanguageKeys } from "#lib/i18n/languageKeys";
import { GuildLogEmbed } from "#lib/structures";
import { Events } from "#lib/types/Enums";
import { getAuditLogExecutor } from "#utils/util";
import { ApplyOptions } from "@sapphire/decorators";
import { Listener, ListenerOptions } from "@sapphire/framework";
import { isNullish } from "@sapphire/utilities";
import { ThreadChannel, User } from "discord.js";
import type { TFunction } from 'i18next';

@ApplyOptions<ListenerOptions>({ event: Events.ThreadDelete })
export class UserListener extends Listener {
	public async run(thread: ThreadChannel) {
		if (isNullish(thread.id)) return;

		const auditLogExecutor = await getAuditLogExecutor('THREAD_DELETE', thread.guild);
		const guildSettings = await this.container.client.prisma.guildSettings.findFirst({ where: { guildID: thread.guild.id } })
		const T = this.container.i18n.getT(guildSettings?.language as string)

		if (guildSettings?.logChannel && guildSettings.threadDeleteLog) {
			this.container.client.emit(Events.GuildMessageLog, thread.guild, guildSettings?.logChannel, Events.ThreadDelete, this.serverLog(thread, auditLogExecutor, T));
		}
	}

	private serverLog(thread: ThreadChannel, executor: User | null | undefined, t: TFunction) {
		const embed = new GuildLogEmbed()
			.setAuthor(thread.name, thread.guild.iconURL() as string)
			.setDescription(t(LanguageKeys.Miscellaneous.DisplayID, { id: thread.id }))
			.setFooter(t(LanguageKeys.Events.Guilds.Logs.ThreadDeleted, { by: executor ? t(LanguageKeys.Miscellaneous.By, { user: executor?.tag }) : undefined }), executor?.displayAvatarURL() ?? undefined)
			.setType(Events.ThreadDelete);

		// Set channel field depending on parent channel type
		switch (thread.parent?.type) {
			case 'GUILD_NEWS':
				embed.addField(t(LanguageKeys.Miscellaneous.NewsChannel), `<#${thread.parent.id}>`, true);
				break;
			default:
				embed.addField(t(LanguageKeys.Miscellaneous.Channel), `<#${thread.parent?.id}>`, true);
		}

		return embed;
	}
}
