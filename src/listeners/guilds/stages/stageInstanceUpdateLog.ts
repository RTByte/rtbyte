import { LanguageKeys } from "#lib/i18n/languageKeys";
import { GuildLogEmbed } from "#lib/structures";
import { Events } from "#lib/types/Enums";
import { getAuditLogExecutor } from "#utils/util";
import { ApplyOptions } from "@sapphire/decorators";
import { Listener, ListenerOptions } from "@sapphire/framework";
import { cutText, isNullish } from "@sapphire/utilities";
import { Guild, StageInstance, User } from "discord.js";
import type { TFunction } from 'i18next';

@ApplyOptions<ListenerOptions>({ event: Events.StageInstanceUpdate })
export class UserListener extends Listener {
	public async run(oldStage: StageInstance, stage: StageInstance) {
		if (isNullish(stage.id)) return;

		const auditLogExecutor = await getAuditLogExecutor('STAGE_INSTANCE_UPDATE', stage.guild as Guild);
		const guildSettings = await this.container.client.prisma.guildSettings.findFirst({ where: { guildID: stage.guild?.id } })
		const T = this.container.i18n.getT(guildSettings?.language as string)

		if (guildSettings?.logChannel && guildSettings.stageInstanceUpdateLog) {
			this.container.client.emit(Events.GuildMessageLog, stage.guild, guildSettings?.logChannel, Events.StageInstanceUpdate, this.serverLog(oldStage, stage, auditLogExecutor, T));
		}
	}

	private serverLog(oldStage: StageInstance, stage: StageInstance, executor: User | null | undefined, t: TFunction) {
		const embed = new GuildLogEmbed()
			.setAuthor({
				name: cutText(stage.topic, 256),
				url: `https://discord.com/channels/${stage.guildId}/${stage.id}`,
				iconURL: stage.guild?.iconURL() as string
			})
			.setDescription(`${t(LanguageKeys.Miscellaneous.DisplayID, { id: stage.id })}\n<#${stage.channel?.id}>`)
			.setFooter({
				text: t(LanguageKeys.Events.Guilds.Logs.StageInstanceUpdated, { by: executor ? t(LanguageKeys.Miscellaneous.By, { user: executor?.tag }) : undefined }),
				iconURL: executor?.displayAvatarURL() ?? undefined
			})
			.setType(Events.StageInstanceUpdate);

		// Topic changed
		if (oldStage.topic !== stage.topic) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.TopicChanged), t(LanguageKeys.Events.Guilds.Logs.ChangeShortText, { before: oldStage.topic, after: stage.topic }));
		}

		// Privacy changed from members only to public
		if (oldStage.privacyLevel !== stage.privacyLevel) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.PrivacyChanged), t(LanguageKeys.Events.Guilds.Logs.ChangeShortText, {
				before: t(LanguageKeys.Events.Guilds.Logs.MembersOnly),
				after: t(LanguageKeys.Events.Guilds.Logs.Public)
			}));
		}

		return embed;
	}
}
