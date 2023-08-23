import { authenticated } from '#root/lib/util/decorators/routeAuthenticated';
import { initializeGuild } from '#root/lib/util/functions/initialize';
import type { GuildSettings } from '@prisma/client';
import { ApplyOptions } from '@sapphire/decorators';
import { HttpCodes, Route, methods, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';
import { PermissionsBitField } from 'discord.js';

@ApplyOptions<Route.Options>({
	name: 'guildSettings',
	route: 'guilds/:id/settings'
})

export class UserRoute extends Route {
	public constructor(context: Route.Context, options: Route.Options) {
		super(context, {
			...options
		});
	}

	@authenticated()
	public async [methods.GET](request: ApiRequest, response: ApiResponse) {
		const requestAuth = request.auth!
		const { client } = this.container;

		// Fetch the Guild this request is for
		const guild = await client.guilds.fetch(request.params.id);
		if (!guild) response.error(HttpCodes.NotFound);

		// Fetch the GuildMember who sent the request
		const member = await guild.members.fetch(requestAuth.id);
		const canManageServer: boolean = guild.ownerId === member.id || member.permissions.has(PermissionsBitField.Flags.ManageGuild) || member.permissions.has(PermissionsBitField.Flags.Administrator);
		if (!canManageServer) response.error(HttpCodes.Unauthorized);

		// Fetch the GuildSettings from the database
		const { prisma } = this.container;
		const guildSettings = await prisma.guildSettings.findFirst({ where: { id: request.params.id } });

		return response.json({ data: { guildSettings } });
	}

	@authenticated()
	public async [methods.POST](request: ApiRequest, response: ApiResponse) {
		const requestAuth = request.auth!
		const { prisma, client } = this.container;

		// Fetch the Guild this request is for
		const guild = await client.guilds.fetch(request.params.id);
		if (!guild) response.error(HttpCodes.NotFound);

		// Fetch the GuildMember who sent the request
		const member = await guild.members.fetch(requestAuth.id);
		const canManageServer: boolean = guild.ownerId === member.id || member.permissions.has(PermissionsBitField.Flags.Administrator) || member.permissions.has(PermissionsBitField.Flags.ManageGuild);
		if (!canManageServer) response.error(HttpCodes.Unauthorized);

		// Get the settings submitted to us from the client
		const body = request.body as any;
		const submittedSettings: any = body.data.guildSettings as object;

		// Bad Request if URL Params ID doesn't match submitted settings ID
		if (request.params.id !== submittedSettings.id) response.error(HttpCodes.BadRequest);

		// Fetch current guild settings
		let guildSettings = await prisma.guildSettings.findFirst({ where: { id: submittedSettings.id } });

		// Initialize guild if it hasn't been initialized yet
		if (!guildSettings) {
			await initializeGuild(guild);
			guildSettings = await prisma.guildSettings.findFirst({ where: { id: submittedSettings.id } });
		}

		// Iterate through local settings, building a list of updated fields
		const updateSettings: any = {};
		for (const key in guildSettings) {
			if (submittedSettings[key] !== guildSettings[key as keyof GuildSettings]) updateSettings[key] = submittedSettings[key];
		}

		// Update local settings in database
		const updatedSettings = await prisma.guildSettings.update({ where: { id: submittedSettings.id }, data: updateSettings });

		// Send newly-updated settings back to client
		response.json({ data: { guildSettings: updatedSettings } });
	}
}