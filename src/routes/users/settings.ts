import { authenticated } from '#root/lib/decorators/routeAuthenticated';
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

		return response.json({ data: { userSettings } });
	}

	@authenticated()
	public [methods.POST](request: ApiRequest, response: ApiResponse) {
		const requestAuth = request.auth!
		// Unauthorized for fetching any UserSettings except your own
		if (requestAuth.id !== request.params.id) return response.error(HttpCodes.Unauthorized);

		response.json({ message: 'Hello World' });
	}
}