import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, type ListenerOptions } from '@sapphire/framework';
import { bold, gray } from 'colorette';
import { Guild } from 'discord.js';

@ApplyOptions<ListenerOptions>({ event: Events.GuildCreate})
export class UserEvent extends Listener {
	public async run(guild: Guild) {
		if (!guild.available) return;

		this.container.logger.info(`Bot added to guild ${bold(guild.name)} (${gray(guild.id)})`)

		await this.guildInitialization(guild);
	}

	private async guildInitialization(guild: Guild) {
		const { logger, prisma } = this.container;

		// Fetch client settings
		const dbClient = await prisma.client.findFirst()

		// Check if guilds are on the guild blacklist
		if (dbClient?.guildBlacklist.includes(guild.id)) {
			await guild.leave();
			return logger.info(`Guild ${bold(guild.name)} (${gray(guild.id)}) is on the guild blacklist, leaving...`);
		}

		const dbGuild = await prisma.guild.findUnique({ where: { id: guild.id } });

		if (!dbGuild) {
			logger.info(`Initializing guild ${bold(guild.name)} (${gray(guild.id)})...`)

			await prisma.guild.create({
				data: {
					id: guild.id,
					guildLogs: { create: {} }
				}
			}).catch(e => {
				logger.error(`Failed to initialize guild ${bold(guild.name)} (${gray(guild.id)}), error below.`);
				logger.error(e);
			});
		}

		logger.info(`Verified initialization of guild ${bold(guild.name)} (${gray(guild.id)})`);
	}
}
