import { LanguageKeys } from "#lib/i18n/languageKeys";
import { GuildLogEmbed } from "#lib/structures";
import { Events } from "#lib/types/Enums";
import { getContent, getImage } from "#utils/util";
import { ApplyOptions } from "@sapphire/decorators";
import { Listener, ListenerOptions } from "@sapphire/framework";
import { cutText, isNullish } from "@sapphire/utilities";
import { Message } from "discord.js";
import type { TFunction } from 'i18next';

@ApplyOptions<ListenerOptions>({ event: Events.GuildMessageUpdate })
export class UserListener extends Listener {
	public async run(oldMessage: Message, message: Message) {
		if (isNullish(message.id)) return;

		const guildSettings = await this.container.client.prisma.guildSettings.findFirst({ where: { guildID: message.guild?.id } });
		const T = this.container.i18n.getT(guildSettings?.language as string);

		if (guildSettings?.logChannel && guildSettings.messageUpdateLog) {
			this.container.client.emit(Events.GuildMessageLog, message.guild, guildSettings?.logChannel, Events.GuildMessageUpdate, this.serverLog(oldMessage, message, T));
		}
	}

	private serverLog(oldMessage: Message, message: Message, t: TFunction) {
		const embed = new GuildLogEmbed()
			.setAuthor(message.author.tag, message.author.displayAvatarURL())
			.setDescription(`<#${message.channel.id}>`)
			.setImage(getImage(message) as string)
			.setFooter(t(LanguageKeys.Events.Guilds.Logs.MessageUpdated))
			.setType(Events.MessageUpdate);

		const oldContent = getContent(oldMessage);
		const content = getContent(message);

		oldContent ? embed.addField(t(LanguageKeys.Miscellaneous.Before), cutText(oldContent as string, 1024)) : embed.setDescription(`<#${message.channel.id}>\n\n${t(LanguageKeys.Events.Guilds.Logs.NoContentBeforeEdit)}`);
		if (content) embed.addField(t(LanguageKeys.Miscellaneous.After), cutText(content, 1024));

		return embed;
	}
}
