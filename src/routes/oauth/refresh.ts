import { ApplyOptions } from '@sapphire/decorators';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { HttpCodes, methods, MimeTypes, Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';
import { Time } from '@sapphire/time-utilities';
import { OAuth2Routes, type RESTPostOAuth2AccessTokenResult } from 'discord.js';
import { stringify } from 'node:querystring';

@ApplyOptions<Route.Options>({
	name: 'oauth/refresh',
	route: 'oauth/refresh'
})

export class RefreshRoute extends Route {
	public constructor(context: Route.Context, options: Route.Options) {
		super(context, {
			...options
		});
	}

	public async [methods.POST](request: ApiRequest, response: ApiResponse) {
		if (!request.auth) return response.error(HttpCodes.Unauthorized);

		const requestAuth = request.auth;
		const serverAuth = this.container.server.auth!;

		let authToken = requestAuth.token;

		// If the token expires in a day, refresh
		if (Date.now() + Time.Day >= requestAuth.expires) {
			const body = await this.refreshToken(requestAuth.id, requestAuth.refresh);
			if (body !== null) {
				const authentication = serverAuth.encrypt({
					id: requestAuth.id,
					token: body.access_token,
					refresh: body.refresh_token,
					expires: Date.now() + body.expires_in * 1000
				});

				response.cookies.add(serverAuth.cookie, authentication, { maxAge: body.expires_in });
				authToken = body.access_token;
			}
		}

		// Refresh the user's data
		try {
			return response.json(await serverAuth.fetchData(authToken));
		} catch (error) {
			this.container.logger.fatal(error);
			return response.error(HttpCodes.InternalServerError);
		}
	}

	private async refreshToken(id: string, refreshToken: string): Promise<RESTPostOAuth2AccessTokenResult | null> {
		const { logger, server } = this.container;
		try {
			logger.debug(`Refreshing Token for ${id}`);
			return await fetch<RESTPostOAuth2AccessTokenResult>(
				OAuth2Routes.tokenURL,
				{
					method: 'POST',
					body: stringify({
						client_id: server.auth!.id,
						client_secret: server.auth!.secret,
						grant_type: 'refresh_token',
						refresh_token: refreshToken,
						redirect_uri: server.auth!.redirect,
						scope: server.auth!.scopes
					}),
					headers: {
						'Content-Type': MimeTypes.ApplicationFormUrlEncoded
					}
				},
				FetchResultTypes.JSON
			);
		} catch (error) {
			logger.fatal(error);
			return null;
		}
	}
}