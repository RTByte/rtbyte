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

@ApplyOptions<ListenerOptions>({ event: Events.GuildMemberUpdate })
export class UserListener extends Listener<typeof SapphireEvents.GuildMemberUpdate> {
	public async run(oldMember: GuildMember, member: GuildMember) {
		if (isNullish(member.id)) return;

		const auditLogExecutor = await getAuditLogExecutor('MEMBER_UPDATE', member.guild);
		const guildSettings = await this.container.client.prisma.guildSettings.findFirst({ where: { guildID: member.guild.id } })
		const T = this.container.i18n.getT(guildSettings?.language as string)

		if (guildSettings?.logChannel && guildSettings.guildMemberUpdateLog) {
			this.container.client.emit(Events.GuildMessageLog, member.guild, guildSettings?.logChannel, Events.EmojiUpdate, this.serverLog(oldMember, member, auditLogExecutor, T));
		}
	}

	private serverLog(oldMember: GuildMember, member: GuildMember, executor: User | null | undefined, t: TFunction) {
		const embed = new GuildLogEmbed()
			.setAuthor({
				name: member.user.tag,
				url: `https://discord.com/users/${member.id}`,
				iconURL: member.user.displayAvatarURL()
			})
			.setDescription(`${t(LanguageKeys.Miscellaneous.DisplayID, { id: member.id })}${member.user.bot ? `\n${Emojis.BotBadge}` : ''}`)
			.setFooter({
				text: t(member.user.bot ? LanguageKeys.Events.Guilds.Logs.BotUpdated : LanguageKeys.Events.Guilds.Logs.UserUpdated, { by: executor ? t(LanguageKeys.Miscellaneous.By, { user: executor?.tag }) : undefined }),
				iconURL: executor?.displayAvatarURL() ?? undefined
			})
			.setType(Events.GuildMemberUpdate);

		// Only apply "updated by" footer if executor and member user are not the same
		if (executor?.id === member.id) embed.setFooter(t(LanguageKeys.Events.Guilds.Logs.UserUpdated, { by: undefined }))

		// Display name changed
		if (oldMember.displayName !== member.displayName) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.DisplayNameChanged), t(LanguageKeys.Events.Guilds.Logs.ChangeShortText, { before: oldMember.displayName, after: member.displayName }));
		}

		// Roles changed
		if (oldMember.roles.cache !== member.roles.cache) {
			const oldRoles = oldMember.roles.cache;
			const roles = member.roles.cache;

			const addedRoles: string[] = [];
			const removedRoles: string[] = [];

			for (const [key, role] of roles.entries()) {
				if (!oldRoles.has(key)) addedRoles.push(`${role}`);
			}

			for (const [key, role] of oldRoles.entries()) {
				if (!roles.has(key)) removedRoles.push(`${role}`);
			}

			if (addedRoles.length) embed.addField(t(LanguageKeys.Events.Guilds.Logs.RolesAdded, { count: addedRoles.length }), addedRoles.join(', ') ?? t(LanguageKeys.Globals.Unknown));
			if (removedRoles.length) embed.addField(t(LanguageKeys.Events.Guilds.Logs.RolesRemoved, { count: removedRoles.length }), removedRoles.join(', ') ?? t(LanguageKeys.Globals.Unknown));
		}

		if (!embed.fields.length) return;

		return embed;
	}
}
