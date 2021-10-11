import { LanguageKeys } from "#lib/i18n/languageKeys";
import { GuildLogEmbed } from "#lib/structures";
import { Events } from "#lib/types/Enums";
import { ApplyOptions } from "@sapphire/decorators";
import { Events as SapphireEvents, Listener, ListenerOptions } from "@sapphire/framework";
import { inlineCodeBlock, isNullish } from "@sapphire/utilities";
import { GuildMember } from "discord.js";
import type { TFunction } from 'i18next';

@ApplyOptions<ListenerOptions>({ event: Events.GuildMemberAdd })
export class UserListener extends Listener<typeof SapphireEvents.GuildMemberAdd> {
	public async run(member: GuildMember) {
		if (isNullish(member.id)) return;
		if (member.user.bot) return;

		const guildSettings = await this.container.client.prisma.guildSettings.findFirst({ where: { guildID: member.guild.id } })
		const T = this.container.i18n.getT(guildSettings?.language as string)

		if (guildSettings?.logChannel && guildSettings.guildMemberAddLog) {
			this.container.client.emit(Events.GuildMessageLog, member.guild, guildSettings?.logChannel, Events.GuildMemberAdd, this.serverLog(member, T));
		}
	}

	private serverLog(member: GuildMember, t: TFunction) {
		const createdOffset = Date.now() - member.user.createdTimestamp;

		const embed = new GuildLogEmbed()
			.setAuthor(member.user.tag, member.user.displayAvatarURL())
			.setDescription(t(LanguageKeys.Miscellaneous.DisplayID, { id: member.id }))
			.addField(t(LanguageKeys.Miscellaneous.Registered), inlineCodeBlock(t(LanguageKeys.Globals.DurationValuePast, { value: createdOffset })))
			.setFooter(t(LanguageKeys.Events.Guilds.Logs.UserJoined))
			.setType(Events.GuildMemberAdd);

		return embed;
	}
}
