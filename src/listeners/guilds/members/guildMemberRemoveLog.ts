import { LanguageKeys } from "#lib/i18n/languageKeys";
import { GuildLogEmbed } from "#lib/structures";
import { Events } from "#lib/types/Enums";
import { Emojis } from "#utils/constants";
import { ApplyOptions } from "@sapphire/decorators";
import { Events as SapphireEvents, Listener, ListenerOptions } from "@sapphire/framework";
import { inlineCodeBlock, isNullish } from "@sapphire/utilities";
import { GuildMember } from "discord.js";
import type { TFunction } from 'i18next';

@ApplyOptions<ListenerOptions>({ event: Events.GuildMemberRemove })
export class UserListener extends Listener<typeof SapphireEvents.GuildMemberRemove> {
	public async run(member: GuildMember) {
		if (isNullish(member.id)) return;

		const guildSettings = await this.container.client.prisma.guildSettings.findFirst({ where: { guildID: member.guild.id } })
		const T = this.container.i18n.getT(guildSettings?.language as string)

		if (guildSettings?.logChannel && guildSettings.guildMemberRemoveLog) {
			this.container.client.emit(Events.GuildMessageLog, member.guild, guildSettings?.logChannel, Events.GuildMemberRemove, this.serverLog(member, T));
		}
	}

	private serverLog(member: GuildMember, t: TFunction) {
		const joinedOffset = Date.now() - Number(member?.joinedTimestamp);

		const embed = new GuildLogEmbed()
			.setAuthor({
				name: member.user.tag,
				url: `https://discord.com/users/${member.user.id}`,
				iconURL: member.user.displayAvatarURL()
			})
			.setDescription(`${t(LanguageKeys.Miscellaneous.DisplayID, { id: member.id })}${member.user.bot ? `\n${Emojis.BotBadge}` : ''}`)
			.addField(t(LanguageKeys.Miscellaneous.Joined), inlineCodeBlock(t(LanguageKeys.Globals.DurationValuePast, { value: joinedOffset })))
			.setFooter(t(member.user.bot ? LanguageKeys.Events.Guilds.Logs.BotLeft : LanguageKeys.Events.Guilds.Logs.UserLeft))
			.setType(Events.GuildMemberRemove);

		return embed;
	}
}
