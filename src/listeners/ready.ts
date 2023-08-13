import { CONTROL_GUILD, DEV, TOKENS, VERSION } from '#root/config';
import { initializeGuild } from '#root/lib/util/functions/initialize';
import type { ListenerOptions, PieceContext } from '@sapphire/framework';
import { Listener, Store } from '@sapphire/framework';
import { bgRed, blue, gray, green, red, whiteBright, yellow } from 'colorette';

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
${line09} ${pad}[${success}] Gateway ${connectionPad}[${success}] Prisma ${connectionPad}[${TOKENS.SENTRY_TOKEN ? success : failure}] Sentry
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
		const { client, logger, prisma } = this.container;

		logger.info('Starting Client validation...');

		// Update stats if client model exists, create db entry if not
		if (client.id) {
			const clientData = await prisma.clientSettings.findFirst();
			if (!clientData) prisma.clientSettings.create({ data: { id: client.id } });

			const restarts = clientData?.restarts;
			restarts?.push(new Date(Date.now()));
			await prisma.clientSettings.update({ where: { id: client.id }, data: { restarts } })
		}

		logger.info('Client validated!');
	}

	private async guildValidation() {
		const { client, logger } = this.container;

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
			await initializeGuild(guild);
		}

		logger.info('All guilds validated!');
	}
}
