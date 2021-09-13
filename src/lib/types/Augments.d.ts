import { GuildChannel, TextChannel, User } from "discord.js";

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
}
