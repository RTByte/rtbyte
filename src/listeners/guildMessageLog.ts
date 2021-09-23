import { GuildLogEmbed } from "#lib/structures";
import { Events } from "#lib/types/Enums";
import { ApplyOptions } from "@sapphire/decorators";
import { canSendEmbeds } from "@sapphire/discord.js-utilities";
import { Listener, ListenerOptions } from "@sapphire/framework";
import { isNullish, Nullish } from "@sapphire/utilities";
import { DiscordAPIError, Guild, HTTPError, TextChannel } from "discord.js";

@ApplyOptions<ListenerOptions>({ event: Events.GuildMessageLog })
export class UserListener extends Listener {
	public async run(guild: Guild, logChannelID: string | Nullish, event: string, logMessage: GuildLogEmbed | undefined) {
		if (isNullish(logChannelID)) return;

		const channel = guild.channels.cache.get(logChannelID) as TextChannel;
		if (!channel) return;

		if (!canSendEmbeds(channel)) return;

		if (isNullish(logMessage)) return;

		try {
			await channel.send({ embeds: [logMessage] });
		} catch (error) {
			this.container.logger.fatal(
				error instanceof DiscordAPIError || error instanceof HTTPError
					? `Failed to send '${event}' log for guild ${guild} in channel ${channel.name}. Error: [${error.code} - ${error.method} | ${error.path}] ${error.message}`
					: `Failed to send '${event}' log for guild ${guild} in channel ${channel.name}. Error: ${(error as Error).message}`
			);
		}
	}
}
