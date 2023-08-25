import { LogLevel } from '@sapphire/framework';
import { GatewayIntentBits, OAuth2Scopes, Partials, type ClientOptions } from 'discord.js';

export const DEV = process.env.NODE_ENV !== 'production';

export const CLIENT_ID = '';
export const CONTROL_GUILD = '';
export const OWNERS: string[] = [''];
export const PREFIX = '=';
export const VERSION = '0.0.0';
export const INIT_ALL_USERS = false;
export const INIT_ALL_MEMBERS = false;

export const CLIENT_OPTIONS: ClientOptions = {
	caseInsensitiveCommands: true,
	caseInsensitivePrefixes: true,
	defaultPrefix: PREFIX,
	regexPrefix: /^(hey +)?bot[,! ]/i,
	shards: 'auto',
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildModeration,
		GatewayIntentBits.GuildEmojisAndStickers,
		GatewayIntentBits.GuildIntegrations,
		GatewayIntentBits.GuildWebhooks,
		GatewayIntentBits.GuildInvites,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildScheduledEvents,
		GatewayIntentBits.AutoModerationConfiguration,
		GatewayIntentBits.AutoModerationExecution
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
	api: {
		auth: {
			id: CLIENT_ID,
			secret: '',
			cookie: 'RTBYTE_AUTH',
			redirect: '',
			scopes: [OAuth2Scopes.Identify, OAuth2Scopes.Guilds, OAuth2Scopes.GuildsMembersRead],
			transformers: []
		},
		prefix: '/',
		origin: '*',
		listenOptions: {
			port: 4000
		}
	}
};

export const API_KEYS = {
	GOOGLE_MAPS: '',
	OPENWEATHER: ''
}

export const TOKENS = {
	BOT_TOKEN: '',
	SENTRY_DNS: '',
};
