import { GuildLogEmbed } from "#lib/structures";
import { WebhookPartialObject } from "#root/listeners/webhooks/webhookUpdate";
import { Nullish } from "@sapphire/utilities";
import { Guild, GuildChannel, Message, TextChannel, User, Webhook } from "discord.js";
import { Events } from "./Enums";

declare module '@sapphire/framework' {
	interface ArgType {
		channelName: GuildChannel;
		textChannelName: TextChannel;
		userName: User;
	}

	interface Preconditions {
		Administrator: never;
		Developer: never;
		Everyone: never;
		Moderator: never;
		ServerOwner: never;
	}

	interface SapphireClient {
		emit(event: Events.Error, error: Error): boolean;
		emit(event: Events.GuildMessageDelete, message: Message): boolean;
		emit(event: Events.GuildMessageLog, guild: Guild, channelID: string | Nullish, eventType: string, guildLogEmbed: GuildLogEmbed | undefined): boolean;
		emit(event: Events.GuildMessageUpdate, oldMessage: Message, message: Message): boolean;
		emit(event: Events.GuildWebhookCreate, channel: TextChannel, executor: User, webhook: Webhook): boolean;
		emit(event: Events.GuildWebhookDelete, channel: TextChannel, executor: User, oldWebhook: WebhookPartialObject): boolean;
		emit(event: Events.GuildWebhookUpdate, channel: TextChannel, executor: User, oldWebhook: WebhookPartialObject, webhook: Webhook): boolean;
		emit(event: string | symbol, ...args: any[]): boolean;
	}
}
