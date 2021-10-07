import { LanguageKeys } from "#lib/i18n/languageKeys";
import { GuildLogEmbed } from "#lib/structures";
import { Events } from "#lib/types/Enums";
import { getAuditLogExecutor } from "#utils/util";
import { ApplyOptions } from "@sapphire/decorators";
import { Events as SapphireEvents, Listener, ListenerOptions } from "@sapphire/framework";
import { isNullish } from "@sapphire/utilities";
import { Guild, Invite, User } from "discord.js";
import type { TFunction } from 'i18next';

@ApplyOptions<ListenerOptions>({ event: Events.InviteDelete })
export class UserListener extends Listener<typeof SapphireEvents.InviteDelete> {
	public async run(invite: Invite) {
		if (isNullish(invite.guild)) return;

		const auditLogExecutor = await getAuditLogExecutor('INVITE_DELETE', invite.guild as Guild);
		const guildSettings = await this.container.client.prisma.guildSettings.findFirst({ where: { guildID: invite.guild.id } })
		const T = this.container.i18n.getT(guildSettings?.language as string)

		if (guildSettings?.logChannel && guildSettings.inviteDeleteLog) {
			this.container.client.emit(Events.GuildMessageLog, invite.guild, guildSettings?.logChannel, Events.InviteDelete, this.serverLog(invite, auditLogExecutor, T));
		}
	}

	private serverLog(invite: Invite, executor: User | null | undefined, t: TFunction) {
		const embed = new GuildLogEmbed()
			.setAuthor(invite.code, invite.guild?.iconURL() as string)
			.setDescription(`${t(LanguageKeys.Miscellaneous.Link)}: \`https://discord.gg/${invite.code}\``)
			.setFooter(t(LanguageKeys.Events.Guilds.Logs.InviteDeleted, { by: executor ? t(LanguageKeys.Miscellaneous.By, { user: executor?.tag }) : undefined }), executor?.displayAvatarURL() ?? undefined)
			.setType(Events.InviteDelete);

		// Set non-guaranteed channel field
		if (invite.channel) {
			let langKey: string;
			switch (invite.channel.type) {
				case 'GUILD_NEWS':
					langKey = t(LanguageKeys.Miscellaneous.NewsChannel);
					break;
				case 'GUILD_STAGE_VOICE':
					langKey = t(LanguageKeys.Miscellaneous.StageChannel);
					break;
				case 'GUILD_STORE':
					langKey = t(LanguageKeys.Miscellaneous.StoreChannel);
					break;
				case 'GUILD_VOICE':
					langKey = t(LanguageKeys.Miscellaneous.VoiceChannel);
					break;
				default:
					langKey = t(LanguageKeys.Miscellaneous.Channel);
			}

			embed.addField(langKey, `<#${invite.channel.id}>`, true);
		}

		return embed;
	}
}
