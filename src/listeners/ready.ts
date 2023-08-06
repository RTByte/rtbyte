import { CONTROL_GUILD, DEV, TOKENS, VERSION } from '#root/config';
import type { ListenerOptions, PieceContext } from '@sapphire/framework';
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
		const { client, prisma } = this.container;

		// Update stats if client model exists, create db entry if not
		await prisma.client.upsert({
			where: { id: String(client.id) },
			update: {
				restarts: { increment: 1 },
				lastRestart: new Date()
			},
			create: {
				id: String(client.id),
				restarts: 0
			}
		})
	}

	private async guildValidation() {
		const { client, logger, prisma } = this.container;

		// Fetch client settings
		const dbClient = await prisma.client.findFirst();

		if (!CONTROL_GUILD) {
			logger.fatal('A control guild has not been set - shutting down...');
			return client.destroy();
		}
		if (!client.guilds.cache.has(CONTROL_GUILD)) {
			logger.fatal('RTByte has not been added to the configured control guild - shutting down...');
			return client.destroy();
		}

		logger.info('Starting guild validation...');

		for (const guildCollection of client.guilds.cache) {
			const guild = guildCollection[1];

			// Check if guilds are on the guild blacklist
			if (dbClient?.guildBlacklist.includes(guild.id)) {
				await guild.leave();
				logger.info(`Guild ${bold(guild.name)} (${gray(guild.id)}) is on the guild blacklist, leaving...`);
			}

			// Check if entry exists for guild. If not, create it
			const dbGuild = await prisma.guild.findUnique({ where: { id: guild.id } });
			if (!dbGuild) {
				logger.info(`Initializing guild ${bold(guild.name)} (${gray(guild.id)})...`)

				await prisma.guild.create({
					data: {
						id: guild.id,
						guildLogs: { create: {} }
					}
				}).catch(e => {
					logger.error(`Failed to initialize guild ${bold(guild.name)} (${gray(guild.id)}), error below.`);
					logger.error(e);
				});
			}

			logger.info(`Verified initialization of guild ${bold(guild.name)} (${gray(guild.id)})`);
		}

		logger.info('All guilds validated!');
	}
}
