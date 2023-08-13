import { container } from '@sapphire/framework';
import { bold, gray } from 'colorette';
import { Guild, User } from "discord.js";

export async function initializeGuild(guild: Guild) {
	const { logger, prisma } = container;
	const clientSettings = await prisma.clientSettings.findFirst();

	if (clientSettings?.guildBlacklist.includes(guild.id)) {
		await guild.leave();
		logger.info(`Guild ${bold(guild.name)} (${gray(guild.id)}) is on the guild blacklist, leaving...`);
	}

	// Check if entry exists for guild. If not, create it
	const guildInfo = await prisma.guild.findUnique({ where: { id: guild.id } });
	const guildSettings = await prisma.guildSettings.findUnique({ where: { id: guild.id } });
	const guildSettingsChatFilter = await prisma.guildSettingsChatFilter.findUnique({ where: { id: guild.id } });
	const guildSettingsLogs = await prisma.guildSettingsInfoLogs.findUnique({ where: { id: guild.id } });
	const guildSettingsModActions = await prisma.guildSettingsModActions.findUnique({ where: { id: guild.id } });

	if (!guildInfo || !guildSettings || !guildSettingsChatFilter || !guildSettingsLogs || !guildSettingsModActions) {
		logger.info(`Initializing guild ${bold(guild.name)} (${gray(guild.id)})...`)

		if (!guildInfo) {
			await prisma.guild.create({
				data: {
					id: guild.id
				}
			}).catch(e => {
				logger.error(`Failed to initialize guild info for ${bold(guild.name)} (${gray(guild.id)}), error below.`);
				logger.error(e);
			});
		}

		if (!guildSettings) {
			await prisma.guildSettings.create({
				data: {
					id: guild.id
				}
			}).catch(e => {
				logger.error(`Failed to initialize guildSettings for ${bold(guild.name)} (${gray(guild.id)}), error below.`);
				logger.error(e);
			});
		}

		if (!guildSettingsChatFilter) {
			await prisma.guildSettingsChatFilter.create({
				data: {
					id: guild.id
				}
			}).catch(e => {
				logger.error(`Failed to initialize guildSettingsChatFilter for ${bold(guild.name)} (${gray(guild.id)}), error below.`);
				logger.error(e);
			});
		}

		if (!guildSettingsLogs) {
			await prisma.guildSettingsInfoLogs.create({
				data: {
					id: guild.id
				}
			}).catch(e => {
				logger.error(`Failed to initialize guildSettingsLogs for ${bold(guild.name)} (${gray(guild.id)}), error below.`);
				logger.error(e);
			});
		}

		if (!guildSettingsModActions) {
			await prisma.guildSettingsModActions.create({
				data: {
					id: guild.id
				}
			}).catch(e => {
				logger.error(`Failed to initialize guildSettingsModActions for ${bold(guild.name)} (${gray(guild.id)}), error below.`);
				logger.error(e);
			});
		}

	}

	logger.info(`Verified initialization of guild ${bold(guild.name)} (${gray(guild.id)})`);
}

export async function initializeUser(user: User) {
	const { logger, prisma } = container;
	const clientSettings = await prisma.clientSettings.findFirst();

	logger.info(`Initializing user ${bold(user.username)} (${gray(user.id)})...`);

	if (clientSettings?.userBlacklist.includes(user.id)) logger.info(`User ${bold(user.username)} (${gray(user.id)}) is on the user blacklist...`);

	const userInfo = await prisma.user.findUnique({ where: { id: user.id } });
	const userSettings = await prisma.userSettings.findUnique({ where: { id: user.id } });

	if (!userInfo) {
		await prisma.user.create({
			data: {
				id: user.id
			}
		}).catch(e => {
			logger.error(`Failed to initialize user info for ${bold(user.username)} (${gray(user.id)}), error below.`);
			logger.error(e);
		});
	}

	if (!userSettings) {
		await prisma.userSettings.create({
			data: {
				id: user.id
			}
		}).catch(e => {
			logger.error(`Failed to initialize user settings for ${bold(user.username)} (${gray(user.id)}), error below.`);
			logger.error(e);
		});
	}

	return logger.info(`Verified initialization of user ${bold(user.username)} (${gray(user.id)})`);
}

export async function initializeMember(user: User, guild: Guild) {
	await initializeUser(user);
	const { logger, prisma } = container;
	const clientSettings = await prisma.clientSettings.findFirst();

	logger.info(`Initializing member ${bold(user.username)} (${gray(user.id)}) in guild ${bold(guild.name)} (${gray(guild.id)})...`);

	if (clientSettings?.userBlacklist.includes(user.id)) logger.info(`User ${bold(user.username)} (${gray(user.id)}) is on the user blacklist...`);

	const memberInfo = await prisma.member.findFirst({ where: { userID: user.id, guildID: guild.id } });

	if (!memberInfo) {
		await prisma.member.create({
			data: {
				userID: user.id,
				guildID: guild.id
			}
		}).catch(e => {
			logger.error(`Failed to initialize member info for ${bold(user.username)} (${gray(user.id)}) in guild ${bold(guild.name)} (${gray(guild.id)}), error below.`);
			logger.error(e);
		});
	}

	return logger.info(`Verified initialization of member ${bold(user.username)} (${gray(user.id)}) in guild ${bold(guild.name)} (${gray(guild.id)})`);
}