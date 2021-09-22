import { CLIENT_OPTIONS, PREFIX } from "#root/config";
import { isGuildMessage } from "#utils/common";
import { PrismaClient } from "@prisma/client";
import { SapphireClient } from '@sapphire/framework';
import type { InternationalizationContext } from '@sapphire/plugin-i18next';
import { bold, cyanBright, green } from "colorette";
import { Message } from "discord.js";

export class RTByteClient extends SapphireClient {
	public prisma!: PrismaClient;

	public constructor() {
		super(CLIENT_OPTIONS);
	}

	/**
	 * Retrieves the prefix for the guild.
	 * @param message The message that gives context.
	 */
	 public fetchPrefix = async (message: Message) => {
		if (!isGuildMessage(message)) return [PREFIX, ''];

		// Fetch guild settings
		const guildSettings = await this.prisma.guildSettings.findFirst({ where: { guildID: message.guild.id } });

		// Return custom guild prefix or default
		return guildSettings?.prefix ?? PREFIX;
	};

	/**
	 * Retrieves the language key for the message.
	 * @param message The message that gives context.
	 */
	public fetchLanguage = async (message: InternationalizationContext) => {
		if (!message.guild) return 'en-US';

		// Fetch guild settings
		const guildSettings = await this.prisma.guildSettings.findFirst({ where: { guildID: message.guild?.id } });

		return guildSettings?.language;
	};

	public async login(token?: string) {
		const prisma = new PrismaClient({
			log: [
				{ emit: 'stdout', level: 'warn' },
				{ emit: 'stdout', level: 'error' },
				{ emit: 'event', level: 'query' },
			],
			errorFormat: 'pretty'
		});

		this.prisma = prisma;

		prisma.$use(async (params, next) => {
			const before = Date.now();

			const result = await next(params);

			const after = Date.now();

			this.logger.debug(
				`${cyanBright('prisma:query')} ${bold(`${params.model}.${params.action}`)} took ${bold(
					`${green(String(after - before))}ms`,
				)}`,
			);

			return result;
		});

		await prisma.$connect();

		this.logger.info('Connecting to Discord...');
		return super.login(token);
	}

	public destroy() {
		void this.prisma.$disconnect();
		return super.destroy();
	}
}

declare module 'discord.js' {
	export interface Client {
		prisma: PrismaClient;
	}
}
