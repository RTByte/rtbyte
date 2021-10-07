import { Events } from '#lib/types/Enums';
import { isGuildMessage } from "#utils/common";
import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from "@sapphire/framework";
import { Message } from "discord.js";

@ApplyOptions<ListenerOptions>({ event: Events.MessageDelete })
export class UserListener extends Listener {
	public run(message: Message) {
		if (message.partial || !isGuildMessage(message) || message.author.bot) return;
		this.container.client.emit(Events.GuildMessageDelete, message);
	}
}
