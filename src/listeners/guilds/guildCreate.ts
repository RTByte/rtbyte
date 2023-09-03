import { initializeGuild } from '#utils/functions/initialize';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, type ListenerOptions } from '@sapphire/framework';
import { bold, gray } from 'colorette';
import { Guild } from 'discord.js';

@ApplyOptions<ListenerOptions>({ event: Events.GuildCreate })
export class UserEvent extends Listener {
	public async run(guild: Guild) {
		if (!guild.available) return;

		this.container.logger.info(`Bot added to guild ${bold(guild.name)} (${gray(guild.id)})`)

		await initializeGuild(guild);
	}
}
