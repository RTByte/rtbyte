import { FirestoreCollections } from '@lib/types/Types';
import { DEV, TOKENS, VERSION } from '@root/config';
import { ApplyOptions } from '@sapphire/decorators';
import { Event, EventOptions, Events } from '@sapphire/framework';
import { bgRed, cyan, green, red } from 'colorette';

@ApplyOptions<EventOptions>({
	event: Events.Ready
})
export default class extends Event<Events.Ready> {

	public async run() {
		const success = green('+');
		const failed = red('-');

		const ascii01 = '___ _____ ______   _______ ___ ';
		const ascii02 = '| _ \\_   _| _ ) \\ / /_   _| __|';
		const ascii03 = '|   / | | | _ \\\\ V /  | | | _| ';
		const ascii04 = '|_|_\\ |_| |___/ |_|   |_| |___|';

		await this.client.logger.info(
			String.raw`
${ascii01}
${ascii02}
${ascii03}
${ascii04}
${DEV ? `${bgRed('DEVELOPMENT MODE')} ${VERSION.padStart(14, ' ')}` : VERSION.padStart(31, ' ')}

[${await this.client.firestore.hasCollection(FirestoreCollections.Client) ? success : failed}] Firebase ${`[${TOKENS.SENTRY_DNS ? success : failed}] Sentry`.padStart(28, ' ')}

${cyan('Connected to:')}
${`- ${this.client.guilds.cache.size} servers`}
${`- ${this.client.channels.cache.size} channels`}
${`- ${this.client.users.cache.size} users`}
			`.trim()
		);
	}

}
