import { GuildTextBasedChannelTypes } from "@sapphire/discord.js-utilities";
import { DMChannel, Guild, GuildMember, Message } from "discord.js";

export interface GuildMessage extends Message {
	channel: GuildTextBasedChannelTypes;
	readonly guild: Guild;
	readonly member: GuildMember;
}

export interface DMMessage extends Message {
	channel: DMChannel;
	readonly guild: null;
	readonly member: null;
}
