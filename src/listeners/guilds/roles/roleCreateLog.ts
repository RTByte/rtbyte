import { LanguageKeys } from "#lib/i18n/languageKeys";
import { GuildLogEmbed } from "#lib/structures";
import { Events } from "#lib/types/Enums";
import { getAuditLogExecutor } from "#utils/util";
import { ApplyOptions } from "@sapphire/decorators";
import { Events as SapphireEvents, Listener, ListenerOptions } from "@sapphire/framework";
import { isNullish } from "@sapphire/utilities";
import { Role, User } from "discord.js";
import type { TFunction } from 'i18next';

@ApplyOptions<ListenerOptions>({ event: Events.RoleCreate })
export class UserListener extends Listener<typeof SapphireEvents.GuildRoleCreate> {
	public async run(role: Role) {
		if (isNullish(role.id)) return;

		const auditLogExecutor = await getAuditLogExecutor('ROLE_CREATE', role.guild);
		const guildSettings = await this.container.client.prisma.guildSettings.findFirst({ where: { guildID: role.guild.id } })
		const T = this.container.i18n.getT(guildSettings?.language as string)

		if (guildSettings?.logChannel && guildSettings.roleCreateLog) {
			this.container.client.emit(Events.GuildMessageLog, role.guild, guildSettings?.logChannel, Events.RoleCreate, this.serverLog(role, auditLogExecutor, T));
		}
	}

	private serverLog(role: Role, executor: User | null | undefined, t: TFunction) {
		const embed = new GuildLogEmbed()
			.setAuthor(role.name, role.guild.iconURL() as string)
			.setDescription(`${t(LanguageKeys.Miscellaneous.DisplayID, { id: role.id })} \n${role}`)
			.setFooter(t(LanguageKeys.Events.Guilds.Logs.RoleCreated, { by: executor ? t(LanguageKeys.Miscellaneous.By, { user: executor?.tag }) : undefined }), executor?.displayAvatarURL() ?? undefined)
			.setType(Events.RoleCreate);

		return embed;
	}
}
