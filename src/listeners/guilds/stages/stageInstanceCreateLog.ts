import { LanguageKeys } from "#lib/i18n/languageKeys";
import { GuildLogEmbed } from "#lib/structures";
import { Events } from "#lib/types/Enums";
import { getAuditLogExecutor } from "#utils/util";
import { ApplyOptions } from "@sapphire/decorators";
import { Listener, ListenerOptions } from "@sapphire/framework";
import { cutText, inlineCodeBlock, isNullish } from "@sapphire/utilities";
import { Guild, StageInstance, User } from "discord.js";
import type { TFunction } from 'i18next';

@ApplyOptions<ListenerOptions>({ event: Events.StageInstanceCreate })
export class UserListener extends Listener {
	public async run(stage: StageInstance) {
		if (isNullish(stage.id)) return;

		const auditLogExecutor = await getAuditLogExecutor('STAGE_INSTANCE_CREATE', stage.guild as Guild);
		const guildSettings = await this.container.client.prisma.guildSettings.findFirst({ where: { guildID: stage.guild?.id } })
		const T = this.container.i18n.getT(guildSettings?.language as string)

		if (guildSettings?.logChannel && guildSettings.stageInstanceCreateLog) {
			this.container.client.emit(Events.GuildMessageLog, stage.guild, guildSettings?.logChannel, Events.StageInstanceCreate, this.serverLog(stage, auditLogExecutor, T));
		}
	}

	private serverLog(stage: StageInstance, executor: User | null | undefined, t: TFunction) {
		const embed = new GuildLogEmbed()
			.setAuthor({
				name: cutText(stage.topic, 256),
				url: `https://discord.com/channels/${stage.guildId}/${stage.id}`,
				iconURL: stage.guild?.iconURL() as string
			})
			.setDescription(`${t(LanguageKeys.Miscellaneous.DisplayID, { id: stage.id })}\n<#${stage.channel?.id}>`)
			.addField(t(LanguageKeys.Events.Guilds.Logs.Privacy), stage.privacyLevel === 'GUILD_ONLY' ? inlineCodeBlock(t(LanguageKeys.Events.Guilds.Logs.MembersOnly)) : inlineCodeBlock(t(LanguageKeys.Events.Guilds.Logs.Public)))
			.setFooter({
				text: t(LanguageKeys.Events.Guilds.Logs.StageInstanceCreated, { by: executor ? t(LanguageKeys.Miscellaneous.By, { user: executor?.tag }) : undefined }),
				iconURL: executor?.displayAvatarURL() ?? undefined
			})
			.setType(Events.StageInstanceCreate);

		return embed;
	}
}
