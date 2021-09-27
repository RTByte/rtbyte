import { LanguageKeys } from "#lib/i18n/languageKeys";
import { GuildLogEmbed } from "#lib/structures";
import { Events } from "#lib/types/Enums";
import { WebhookPartialObject } from "#root/listeners/webhooks/webhookUpdate";
import { pickRandom } from "#utils/util";
import { ApplyOptions } from "@sapphire/decorators";
import { Listener, ListenerOptions } from "@sapphire/framework";
import { isNullish } from "@sapphire/utilities";
import { TextChannel, User } from "discord.js";
import type { TFunction } from 'i18next';

@ApplyOptions<ListenerOptions>({ event: Events.GuildWebhookDelete })
export class UserListener extends Listener {
	public async run(channel: TextChannel, executor: User, webhook: WebhookPartialObject) {
		if (isNullish(channel.id)) return;

		const guildSettings = await this.container.client.prisma.guildSettings.findFirst({ where: { guildID: channel.guild.id } })
		const T = this.container.i18n.getT(guildSettings?.language as string)

		if (guildSettings?.logChannel && guildSettings.webhookDeleteLog) {
			this.container.client.emit(Events.GuildMessageLog, channel.guild, guildSettings?.logChannel, Events.GuildWebhookDelete, this.serverLog(channel, executor, webhook, T));
		}
	}

	private serverLog(channel: TextChannel, executor: User, webhook: WebhookPartialObject, t: TFunction) {
		const backupAvatar = pickRandom([0, 1, 2, 3, 4, 5]);

		const embed = new GuildLogEmbed()
			.setAuthor(webhook.name, webhook.avatar ?? `https://cdn.discordapp.com/embed/avatars/${backupAvatar}.png`)
			.setDescription(`${t(LanguageKeys.Miscellaneous.DisplayID, { id: webhook.id })}\n<#${channel.id}>`)
			.setFooter(t(LanguageKeys.Events.Guilds.Logs.WebhookDeleted, { by: executor ? t(LanguageKeys.Miscellaneous.By, { user: executor?.tag }) : undefined }), executor?.displayAvatarURL() ?? undefined)
			.setType(Events.GuildWebhookDelete);

		return embed;
	}
}
