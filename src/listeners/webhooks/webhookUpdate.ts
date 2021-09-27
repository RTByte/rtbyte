import { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from "@sapphire/framework";
import { GuildAuditLogsEntry, TextChannel, Webhook } from 'discord.js';

@ApplyOptions<ListenerOptions>({ event: Events.WebhookUpdate })
export class UserListener extends Listener {
	public async run(channel: TextChannel) {
		if (!channel.guild.me?.permissions.has('VIEW_AUDIT_LOG')) return;

		const logEntry = (await channel.guild.fetchAuditLogs()).entries.first() as GuildAuditLogsEntry;
		const { action, changes, executor } = logEntry;
		const webhook = logEntry.target as Webhook;

		const oldWebhook = {
			id: webhook.id,
			channel: changes?.find(o => o.key === 'channel_id') ? channel.guild.channels.cache.get(changes.find(o => o.key === 'channel_id')?.old as string) : undefined,
			name: changes?.find(o => o.key === 'name') ? changes.find(o => o.key === 'name')?.old : undefined,
			avatar: changes?.find(o => o.key === 'avatar_hash') ? `https://cdn.discordapp.com/avatars/${webhook.id}/${changes.find(o => o.key === 'avatar_hash')?.old}.jpg` : undefined
		};

		if (action === 'WEBHOOK_CREATE') return this.container.client.emit(Events.GuildWebhookCreate, channel, executor, webhook);
		if (action === 'WEBHOOK_DELETE') return this.container.client.emit(Events.GuildWebhookDelete, channel, executor, oldWebhook as WebhookPartialObject);
		if (action === 'WEBHOOK_UPDATE') return this.container.client.emit(Events.GuildWebhookUpdate, channel, executor, oldWebhook as WebhookPartialObject, webhook);

		return null;
	}
}

export interface WebhookPartialObject {
	id: string,
	channel: TextChannel,
	name: string,
	avatar: string
}
