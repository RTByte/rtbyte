import { authenticated } from '#root/lib/util/decorators/routeAuthenticated';
import { initializeUser } from '#root/lib/util/functions/initialize';
import type { UserSettings } from '@prisma/client';
import { ApplyOptions } from '@sapphire/decorators';
import { HttpCodes, Route, methods, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';

@ApplyOptions<Route.Options>({
	name: 'userSettings',
	route: 'users/:id/settings'
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
		// Unauthorized for fetching any UserSettings except your own
		if (requestAuth.id !== request.params.id) return response.error(HttpCodes.Unauthorized);

		const { prisma } = this.container;
		const userSettings = await prisma.userSettings.findFirst({ where: { id: request.params.id } });

		return response.json({ userSettings });
	}

	@authenticated()
	public async [methods.POST](request: ApiRequest, response: ApiResponse) {
		const requestAuth = request.auth!
		// Unauthorized for fetching any UserSettings except your own
		if (requestAuth.id !== request.params.id) return response.error(HttpCodes.Unauthorized);

		// Get the settings submitted to us from the client
		const body = request.body as any;
		const submittedSettings: any = body.userSettings as object;

		// Unauthorized if trying to update settings that aren't your own
		if (requestAuth.id !== submittedSettings?.id) return response.error(HttpCodes.Unauthorized);

		// Fetch current user settings
		const { prisma, client } = this.container;
		let userSettings = await prisma.userSettings.findFirst({ where: { id: submittedSettings.id } });

		if (!userSettings) {
			await initializeUser(await client.users.fetch(requestAuth.id), requestAuth.id);
			userSettings = await prisma.userSettings.findFirst({ where: { id: submittedSettings.id } });
		}

		const updateSettings: any = {};
		for (const key in userSettings) {
			if (submittedSettings[key] !== userSettings[key as keyof UserSettings]) updateSettings[key] = submittedSettings[key];
		}

		const updatedSettings = await prisma.userSettings.update({ where: { id: submittedSettings.id }, data: updateSettings });

		response.json({ userSettings: updatedSettings });
	}
}