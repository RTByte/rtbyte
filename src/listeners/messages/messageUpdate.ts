import { Events } from '#lib/types/Enums';
import { isGuildMessage } from "#utils/common";
import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from "@sapphire/framework";
import { Message } from "discord.js";

@ApplyOptions<ListenerOptions>({ event: Events.MessageUpdate })
export class UserListener extends Listener {
	public run(oldMessage: Message, message: Message) {
		if (!isGuildMessage(message) || oldMessage.content === message.content || message.author.bot) return;
		this.container.client.emit(Events.GuildMessageUpdate, oldMessage, message);
	}
}
