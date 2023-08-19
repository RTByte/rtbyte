import { container } from '@sapphire/framework';
import type { LoginData } from '@sapphire/plugin-api';
import { type RESTAPIPartialCurrentUserGuild } from 'discord.js';

interface TransformedLoginData extends LoginData {
	transformedGuilds?: (RESTAPIPartialCurrentUserGuild & { botInGuild: boolean })[] | null;
}

export function transformOauthGuilds(loginData: LoginData): TransformedLoginData {
	const { client } = container;

	const transformedGuilds = loginData.guilds?.map((guild) => {
		const cachedGuild = client.guilds.cache.get(guild.id);
		const canManageServer: boolean = guild.owner || ((parseInt(guild.permissions, 10) & 0x20) !== 0) || ((parseInt(guild.permissions, 10) & 0x8) !== 0);



		return {
			...guild,
			botInGuild: typeof cachedGuild !== 'undefined',
			canManageServer
		};
	});

	return { ...loginData, transformedGuilds };
}