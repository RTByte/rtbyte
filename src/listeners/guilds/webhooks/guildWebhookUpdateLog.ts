import { LanguageKeys } from "#lib/i18n/languageKeys";
import { GuildLogEmbed } from "#lib/structures";
import { Events } from "#lib/types/Enums";
import { WebhookPartialObject } from "#root/listeners/webhooks/webhookUpdate";
import { pickRandom } from "#utils/util";
import { ApplyOptions } from "@sapphire/decorators";
import { Listener, ListenerOptions } from "@sapphire/framework";
import { isNullish } from "@sapphire/utilities";
import { TextChannel, User, Webhook } from "discord.js";
import type { TFunction } from 'i18next';

@ApplyOptions<ListenerOptions>({ event: Events.GuildWebhookUpdate })
export class UserListener extends Listener {
	public async run(channel: TextChannel, executor: User, oldWebhook: WebhookPartialObject, webhook: Webhook) {
		if (isNullish(channel.id)) return;

		const guildSettings = await this.container.client.prisma.guildSettings.findFirst({ where: { guildID: channel.guild.id } })
		const T = this.container.i18n.getT(guildSettings?.language as string)

		if (guildSettings?.logChannel && guildSettings.webhookUpdateLog) {
			this.container.client.emit(Events.GuildMessageLog, channel.guild, guildSettings?.logChannel, Events.GuildWebhookUpdate, this.serverLog(channel, executor, oldWebhook, webhook, T));
		}
	}

	private serverLog(channel: TextChannel, executor: User, oldWebhook: WebhookPartialObject, webhook: Webhook, t: TFunction) {
		const backupAvatar = pickRandom([0, 1, 2, 3, 4, 5])

		const embed = new GuildLogEmbed()
			.setAuthor(webhook.name , webhook.avatarURL() ?? `https://cdn.discordapp.com/embed/avatars/${backupAvatar}.png`)
			.setDescription(`${t(LanguageKeys.Miscellaneous.DisplayID, { id: webhook.id })}\n<#${channel.id}>`)
			.setFooter(t(LanguageKeys.Events.Guilds.Logs.WebhookUpdated, { by: executor ? t(LanguageKeys.Miscellaneous.By, { user: executor?.tag }) : undefined }), executor?.displayAvatarURL() ?? undefined)
			.setType(Events.GuildWebhookUpdate);

		// Name changed
		if (oldWebhook.name && oldWebhook.name !== webhook.name) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.NameChanged), t(LanguageKeys.Events.Guilds.Logs.ChangeShortText, { before: oldWebhook.name, after: webhook.name }));
		}

		// Channel changed
		if (oldWebhook.channel && oldWebhook.channel.id !== channel.id) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.ChannelChanged), t(LanguageKeys.Events.Guilds.Logs.ChangeShortObject, { before: `<#${oldWebhook.channel.id}>`, after: `<#${channel.id}>` }));
		}

		// Avatar changed
		if (oldWebhook.avatar && oldWebhook.avatar !== webhook.avatarURL({ format: 'jpg' })) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.AvatarChanged), t(LanguageKeys.Events.Guilds.Logs.ChangeLongText, {
				before: oldWebhook.avatar.includes('undefined') ? t(LanguageKeys.Globals.None) : oldWebhook.avatar,
				after: webhook.avatarURL({ format: 'jpg' })
			}));
		}

		if (!embed.fields.length) return;

		return embed;
	}
}
