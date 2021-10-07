import { DEV, TOKENS, VERSION } from '#root/config';
import type { ListenerOptions, PieceContext } from '@sapphire/framework';
// eslint-disable-next-line no-duplicate-imports
import { Listener, Store } from '@sapphire/framework';
import { bgRed, blue, bold, gray, green, red, whiteBright, yellow } from 'colorette';

export class UserEvent extends Listener {
	private readonly style = DEV ? yellow : blue;

	public constructor(context: PieceContext, options?: ListenerOptions) {
		super(context, {
			...options,
			once: true
		});
	}

	public async run() {
		this.printBanner();
		this.printStoreDebugInformation();

		await this.clientValidation();
		await this.guildValidation();
	}

	private printBanner() {
		const success = green('+');
		const failure = red('-');

		const line01 = whiteBright(String.raw`       .▄##╗▄▄`);
		const line02 = whiteBright(String.raw`     .S▓█████▓▓▒▄`);
		const line03 = whiteBright(String.raw`   w┌╫▓╣██████▓▓▓▒     ▒▓▓▓▓▓▓▄, ▓▓▓▓▓▓▓▓  ▓▓▓▓▓▓▒   ▓▓,   ▓▓ ▒▓▓▓▓▓▓▓▌ ▓▓▓▓▓▓▓▌`);
		const line04 = whiteBright(String.raw` ▄▄▄▓███${red('▀╫╠╠╠╫')}▓▓▓▓▌    ▓█    ╫██    ██▄    ██   └██  └██▄┌██╙    ╫█▌   .██`);
		const line05 = whiteBright(String.raw`║█████${red('▀╠╠╠▒▒')}▓▓▓▓▓▓▓    ▓██▓▓▓█▀     ██     ██▓▓███▄    ▀██▀      ╫█▌   .███████═`);
		const line06 = whiteBright(String.raw`║████${red('▌╠╠╠╠╫')}▓▓▓▓▓▓▓▌    ▓█  ╙██▄     ██     ██    ██     ██       ╫█▌   .██`);
		const line07 = whiteBright(String.raw` ▀█▓▓▓${red('▒╠╠╢')}▓▓▓▓▓▓▓▓=    ▓█    ▀██    ██     ██▓▓▓██▀     ██       ╫█▌   .██▓▓▓▓▓▓`);
		const line08 = whiteBright(String.raw`  ╜▓▓▓▓▓▓▓▓▓▓▓▓▓▀`);
		const line09 = whiteBright(String.raw`    └╜▀▀▓▓▓▓▀▀╙`);

		// Offset Pad
		const pad = ' '.repeat(7);
		const longPad = ' '.repeat(26);
		const connectionPad = ' '.repeat(12);

		console.log(
			String.raw`
${line01} ${pad} ${bgRed(` ${VERSION} `)} ${DEV ? ` ${longPad}${bgRed(' </> DEVELOPMENT MODE ')}` : ''}
${line02}
${line03}
${line04}
${line05}
${line06}
${line07}
${line08}
${line09} ${pad}[${success}] Gateway ${connectionPad}[${success}] Prisma ${connectionPad}[${TOKENS.SENTRY_DNS ? success : failure}] Sentry
		`.trim()
		);
	}

	private printStoreDebugInformation() {
		const { client, logger } = this.container;
		const stores = [...client.stores.values()];
		const last = stores.pop()!;

		for (const store of stores) logger.info(this.styleStore(store, false));
		logger.info(this.styleStore(last, true));
	}

	private styleStore(store: Store<any>, last: boolean) {
		return gray(`${last ? '└─' : '├─'} Loaded ${this.style(store.size.toString().padEnd(3, ' '))} ${store.name}.`);
	}

	private async clientValidation() {
		const { client } = this.container;

		// Fetch client settings
		const clientSettings = await client.prisma.clientSettings.findFirst()

		// Validate client settings and ensure configuration exists
		if (clientSettings?.clientID !== client.id) {
			await client.prisma.clientSettings.create({
				data: {
					clientID: String(client.id)
				}
			});
		}
	}

	private async guildValidation() {
		const { client, logger } = this.container;

		// Fetch client settings
		const clientSettings = await client.prisma.clientSettings.findFirst()

		logger.info('Starting guild validation...');

		for (const guildCollection of client.guilds.cache) {
			const guild = guildCollection[1];

			// Check if guilds are on the guild blacklist
			if (clientSettings?.guildBlacklist.includes(guild.id)) {
				await guild.leave();
				logger.info(`Guild ${bold(guild.name)} (${guild.id}) is on the guild blacklist, leaving...`);
			}

			// Check if configuration exists for guild. If not, create it
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

		logger.info('All guilds validated!');
	}
}
