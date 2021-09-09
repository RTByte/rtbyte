import { container } from "@sapphire/framework";
import { Awaited, isThenable } from "@sapphire/utilities";
import type { RESTJSONErrorCodes } from 'discord-api-types/v9';
import { DiscordAPIError } from "discord.js";

export async function resolveOnErrorCodes<T>(promise: Promise<T>, ...codes: readonly RESTJSONErrorCodes[]) {
	try {
		return await promise;
	} catch (error) {
		if (error instanceof DiscordAPIError && codes.includes(error.code)) return null;
		throw error;
	}
}

export function floatPromise(promise: Awaited<unknown>) {
	if (isThenable(promise)) promise.catch((error: Error) => container.logger.fatal(error));
}
