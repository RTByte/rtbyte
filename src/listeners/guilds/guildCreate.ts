import { Listener } from '@sapphire/framework';
import { bold } from 'colorette';
import { Guild } from 'discord.js';

export class UserEvent extends Listener<'guildCreate'> {
	public async run(guild: Guild) {
		if (!guild.available) return;

		this.container.logger.info(`Bot added to guild ${bold(guild.name)} (${guild.id})`)

		await this.guildInitialization(guild);
	}

	private async guildInitialization(guild: Guild) {
		const { client, logger } = this.container;

		// Fetch client settings
		const clientSettings = await client.prisma.clientSettings.findFirst()

		// Check if guilds are on the guild blacklist
		if (clientSettings?.guildBlacklist.includes(guild.id)) {
			await guild.leave();
			return logger.info(`Guild ${bold(guild.name)} (${guild.id}) is on the guild blacklist, leaving...`);
		}

		const guildSettings = await client.prisma.guildSettings.findFirst({ where: { guildID: guild.id } });

		if (!guildSettings) {
			logger.info(`Initializing guild ${bold(guild.name)} (${guild.id})...`)

			await client.prisma.guildSettings.create({
				data: {
					guildID: guild.id
				}
			}).catch(e => {
				logger.error(`Failed to initialize guild ${bold(guild.name)} (${guild.id}), error below.`);
				logger.error(e);
			});
		}

		logger.info(`Verified initialization of guild ${bold(guild.name)} (${guild.id})`);
	}
}
