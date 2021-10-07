import { LanguageKeys } from "#lib/i18n/languageKeys";
import { GuildLogEmbed } from "#lib/structures";
import { Events } from "#lib/types/Enums";
import { getContent, getImage } from "#utils/util";
import { ApplyOptions } from "@sapphire/decorators";
import { Listener, ListenerOptions } from "@sapphire/framework";
import { cutText, isNullish } from "@sapphire/utilities";
import { Message } from "discord.js";
import type { TFunction } from 'i18next';

@ApplyOptions<ListenerOptions>({ event: Events.GuildMessageDelete })
export class UserListener extends Listener {
	public async run(message: Message) {
		if (isNullish(message.id)) return;

		const guildSettings = await this.container.client.prisma.guildSettings.findFirst({ where: { guildID: message.guild?.id } });
		const T = this.container.i18n.getT(guildSettings?.language as string);

		if (guildSettings?.logChannel && guildSettings.messageDeleteLog) {
			this.container.client.emit(Events.GuildMessageLog, message.guild, guildSettings?.logChannel, Events.GuildMessageDelete, this.serverLog(message, T));
		}
	}

	private serverLog(message: Message, t: TFunction) {
		const embed = new GuildLogEmbed()
			.setAuthor(message.author.tag, message.author.displayAvatarURL())
			.setDescription(`<#${message.channel.id}>`)
			.setImage(getImage(message) as string)
			.setFooter(t(LanguageKeys.Events.Guilds.Logs.MessageDeleted))
			.setType(Events.MessageDelete);

		const content = getContent(message);
		if (content) embed.addField(t(LanguageKeys.Miscellaneous.Message), cutText(content, 1024));

		return embed;
	}
}
