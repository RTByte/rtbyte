/* eslint-disable @typescript-eslint/naming-convention */
import type { ClientOptions } from 'discord.js';

export const DEV = 'DEV' in process.env ? process.env.DEV === 'true' : !('PM2_HOME' in process.env);

export const OWNERS: string[] = ['106061111605878784'];
export const PREFIX = '-';

export const CLIENT_OPTIONS: ClientOptions = { };

export const API_KEYS = {
	DAKRSKY: '',
	GENIUS: '',
	GOOGLE_MAPS: '',
	TWITCH: '',
	TWITCH_SECRET: ''
};

export const FIREBASE_ADMIN = {
	type: '',
	project_id: '',
	private_key_id: '',
	private_key: '',
	client_email: '',
	client_id: '',
	auth_uri: '',
	token_uri: '',
	auth_provider_x509_cert_url: '',
	client_x509_cert_url: ''
};

export const TOKENS = {
	BOT_TOKEN: '',
	SENTRY_DNS: ''
};
