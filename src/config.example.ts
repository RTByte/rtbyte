import { LogLevel } from '@sapphire/framework';
import { GatewayIntentBits, Partials, type ClientOptions } from 'discord.js';

export const DEV = process.env.NODE_ENV !== 'production';

export const CLIENT_ID = '';
export const CONTROL_GUILD = '';
export const OWNERS: string[] = [''];
export const PREFIX = '=';
export const VERSION = '0.0.0';

export const CLIENT_OPTIONS: ClientOptions = {
	caseInsensitiveCommands: true,
	caseInsensitivePrefixes: true,
	defaultPrefix: PREFIX,
	regexPrefix: /^(hey +)?bot[,! ]/i,
	shards: 'auto',
	intents: [
		GatewayIntentBits.GuildBans,
		GatewayIntentBits.GuildEmojisAndStickers,
		GatewayIntentBits.GuildInvites,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildScheduledEvents,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.Guilds,
		GatewayIntentBits.MessageContent
	],
	loadDefaultErrorListeners: false,
	partials: [Partials.Channel, Partials.GuildMember, Partials.GuildScheduledEvent, Partials.Message, Partials.Reaction, Partials.User],
	presence: {
		activities: [
			{
				name: '',
				type: 3
			}
		]
	},
	logger: {
		level: DEV ? LogLevel.Debug : LogLevel.Info
	},
};

export const API_KEYS = {
	GOOGLE_MAPS: '',
	OPENWEATHER: ''
}

export const TOKENS = {
	BOT_TOKEN: '',
	SENTRY_DNS: '',
};
