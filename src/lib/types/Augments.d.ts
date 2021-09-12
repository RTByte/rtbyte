import { GuildChannel, TextChannel } from "discord.js";

declare module '@sapphire/framework' {
	interface ArgType {
		channelName: GuildChannel;
		textChannelName: TextChannel;
	}

	interface Preconditions {
		Administrator: never;
		Developer: never;
		Everyone: never;
		Moderator: never;
		ServerOwner: never;
	}
}
