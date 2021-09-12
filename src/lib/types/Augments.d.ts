import { GuildChannel, TextChannel } from "discord.js";

declare module '@sapphire/framework' {
	interface ArgType {
		channelName: GuildChannel;
		textChannelName: TextChannel;
	}
}
