import { LanguageKeys } from "#lib/i18n/languageKeys";
import { GuildLogEmbed } from "#lib/structures";
import { Events } from "#lib/types/Enums";
import { Emojis } from "#utils/constants";
import { getAuditLogExecutor } from "#utils/util";
import { ApplyOptions } from "@sapphire/decorators";
import { Events as SapphireEvents, Listener, ListenerOptions } from "@sapphire/framework";
import { isNullish } from "@sapphire/utilities";
import { Role, User } from "discord.js";
import type { TFunction } from 'i18next';

@ApplyOptions<ListenerOptions>({ event: Events.RoleUpdate })
export class UserListener extends Listener<typeof SapphireEvents.GuildRoleUpdate> {
	public async run(oldRole: Role, role: Role) {
		if (isNullish(role.id)) return;

		const auditLogExecutor = await getAuditLogExecutor('ROLE_UPDATE', role.guild);
		const guildSettings = await this.container.client.prisma.guildSettings.findFirst({ where: { guildID: role.guild.id } })
		const T = this.container.i18n.getT(guildSettings?.language as string)

		if (guildSettings?.logChannel && guildSettings.roleUpdateLog) {
			this.container.client.emit(Events.GuildMessageLog, role.guild, guildSettings?.logChannel, Events.RoleUpdate, this.serverLog(oldRole, role, auditLogExecutor, T));
		}
	}

	private serverLog(oldRole: Role, role: Role, executor: User | null | undefined, t: TFunction) {
		const embed = new GuildLogEmbed()
			.setAuthor(role.name, role.guild.iconURL() as string)
			.setDescription(`${t(LanguageKeys.Miscellaneous.DisplayID, { id: role.id })} \n${role}`)
			.setFooter(t(LanguageKeys.Events.Guilds.Logs.RoleUpdated, { by: executor ? t(LanguageKeys.Miscellaneous.By, { user: executor?.tag }) : undefined }), executor?.displayAvatarURL() ?? undefined)
			.setType(Events.RoleUpdate);

		// Name changed
		if (oldRole.name !== role.name) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.NameChanged), t(LanguageKeys.Events.Guilds.Logs.ChangeShortText, { before: oldRole.name, after: role.name }));
		}

		// Color changed
		if (oldRole.color !== role.color) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.ColorChanged), t(LanguageKeys.Events.Guilds.Logs.ChangeShortText, { before: oldRole.hexColor, after: role.hexColor }));
		}

		// Hoist toggled
		if (oldRole.hoist !== role.hoist) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.HoistToggled), role.hoist ? Emojis.Check : Emojis.X);
		}

		// Mentionable toggled
		if (oldRole.mentionable !== role.mentionable) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.MentionableToggled), role.mentionable ? Emojis.Check : Emojis.X);
		}

		// Permissions changed
		if (oldRole.permissions.bitfield !== role.permissions.bitfield) {
			if (oldRole.permissions.toArray().length > 32 || role.permissions.toArray().length > 32) {
				embed.setDescription(`${t(LanguageKeys.Miscellaneous.DisplayID, { id: role.id })} \n${role}\n\n**${t(LanguageKeys.Events.Guilds.Logs.PermissionsChanged)}**\n${t(LanguageKeys.Events.Guilds.Logs.PermissionsFormatted, { before: oldRole.permissions.toArray(), after: role.permissions.toArray() })}`)
				return embed;
			}

			embed.addField(t(LanguageKeys.Events.Guilds.Logs.PermissionsChanged), t(LanguageKeys.Events.Guilds.Logs.PermissionsFormatted, { before: oldRole.permissions.toArray(), after: role.permissions.toArray() }));
		}

		if (!embed.fields.length) return;

		return embed;
	}
}
