import { GuildChannel, TextChannel, User } from "discord.js";
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
		emit(event: string | symbol, ...args: any[]): boolean;
	}
}
