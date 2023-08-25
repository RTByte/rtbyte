import { authenticated } from '#root/lib/util/decorators/routeAuthenticated';
import { ApplyOptions } from '@sapphire/decorators';
import { HttpCodes, Route, methods, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';
import { PermissionsBitField } from 'discord.js';

@ApplyOptions<Route.Options>({
	name: 'guildChannel',
	route: 'guilds/:guild/channels/:channel'
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
		const guild = await client.guilds.fetch(request.params.guild);
		if (!guild) return response.error(HttpCodes.NotFound);

		// Fetch the GuildMember who sent the request
		const member = await guild.members.fetch(requestAuth.id);
		const canManageServer: boolean = guild.ownerId === member.id || member.permissions.has(PermissionsBitField.Flags.ManageGuild) || member.permissions.has(PermissionsBitField.Flags.Administrator);
		if (!canManageServer) return response.error(HttpCodes.Unauthorized);

		// Grab channel from cache
		const channel = await guild.channels.fetch(request.params.channel);
		if (!channel) return response.error(HttpCodes.NotFound);

		// Return channel
		return response.json({ data: { channel } });
	}

}