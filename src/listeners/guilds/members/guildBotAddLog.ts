import { LanguageKeys } from "#lib/i18n/languageKeys";
import { GuildLogEmbed } from "#lib/structures";
import { Events } from "#lib/types/Enums";
import { Emojis } from "#utils/constants";
import { getAuditLogExecutor } from "#utils/util";
import { ApplyOptions } from "@sapphire/decorators";
import { Events as SapphireEvents, Listener, ListenerOptions } from "@sapphire/framework";
import { isNullish } from "@sapphire/utilities";
import { GuildMember, User } from "discord.js";
import type { TFunction } from 'i18next';

@ApplyOptions<ListenerOptions>({ event: Events.GuildMemberAdd })
export class UserListener extends Listener<typeof SapphireEvents.GuildMemberAdd> {
	public async run(member: GuildMember) {
		if (isNullish(member.id)) return;
		if (!member.user.bot) return;

		const auditLogExecutor = await getAuditLogExecutor('BOT_ADD', member.guild);
		const guildSettings = await this.container.client.prisma.guildSettings.findFirst({ where: { guildID: member.guild.id } })
		const T = this.container.i18n.getT(guildSettings?.language as string)

		if (guildSettings?.logChannel && guildSettings.guildBotAddLog) {
			this.container.client.emit(Events.GuildMessageLog, member.guild, guildSettings?.logChannel, Events.GuildBotAdd, this.serverLog(member, auditLogExecutor, T));
		}
	}

	private serverLog(member: GuildMember, executor: User | null | undefined, t: TFunction) {
		const embed = new GuildLogEmbed()
			.setAuthor(member.user.tag, member.user.displayAvatarURL())
			.setDescription(`${t(LanguageKeys.Miscellaneous.DisplayID, { id: member.id })}\n${Emojis.BotBadge}`)
			.setFooter(t(LanguageKeys.Events.Guilds.Logs.BotAdded, { by: executor ? t(LanguageKeys.Miscellaneous.By, { user: executor?.tag }) : undefined }), executor?.displayAvatarURL() ?? undefined)
			.setType(Events.GuildBotAdd);

		return embed;
	}
}
