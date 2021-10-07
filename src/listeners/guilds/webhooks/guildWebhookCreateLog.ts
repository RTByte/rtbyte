import { LanguageKeys } from "#lib/i18n/languageKeys";
import { GuildLogEmbed } from "#lib/structures";
import { Events } from "#lib/types/Enums";
import { pickRandom } from "#utils/util";
import { ApplyOptions } from "@sapphire/decorators";
import { Listener, ListenerOptions } from "@sapphire/framework";
import { isNullish } from "@sapphire/utilities";
import { TextChannel, User, Webhook } from "discord.js";
import type { TFunction } from 'i18next';

@ApplyOptions<ListenerOptions>({ event: Events.GuildWebhookCreate })
export class UserListener extends Listener {
	public async run(channel: TextChannel, executor: User, webhook: Webhook) {
		if (isNullish(channel.id)) return;

		const guildSettings = await this.container.client.prisma.guildSettings.findFirst({ where: { guildID: channel.guild.id } })
		const T = this.container.i18n.getT(guildSettings?.language as string)

		if (guildSettings?.logChannel && guildSettings.webhookCreateLog) {
			this.container.client.emit(Events.GuildMessageLog, channel.guild, guildSettings?.logChannel, Events.GuildWebhookCreate, this.serverLog(channel, executor, webhook, T));
		}
	}

	private serverLog(channel: TextChannel, executor: User, webhook: Webhook, t: TFunction) {
		const backupAvatar = pickRandom([0, 1, 2, 3, 4, 5]);

		const embed = new GuildLogEmbed()
			.setAuthor(webhook.name, webhook.avatarURL() ?? `https://cdn.discordapp.com/embed/avatars/${backupAvatar}.png`)
			.setDescription(`${t(LanguageKeys.Miscellaneous.DisplayID, { id: webhook.id })}\n<#${channel.id}>`)
			.setFooter(t(LanguageKeys.Events.Guilds.Logs.WebhookCreated, { by: executor ? t(LanguageKeys.Miscellaneous.By, { user: executor?.tag }) : undefined }), executor?.displayAvatarURL() ?? undefined)
			.setType(Events.GuildWebhookCreate);

		return embed;
	}
}
