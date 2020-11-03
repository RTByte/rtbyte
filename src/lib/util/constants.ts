/* eslint-disable @typescript-eslint/naming-convention */
import { RTByteFormatters } from '../types/Types';
import { list } from '@util/languageFunctions';
import { ClientOptions } from 'discord.js';
import i18next from 'i18next';

export const enum Colors {
	accent = '#FE3132',
	white = '#FEFEFE',
	red = '#FF4B4B',
	green = '#4BFF4B',
	yellow = '#FFFF4B',
	blue = '#4B4BFF',
	pink = '#F47FFF',
	gold = '#DAA520',
	purple = '#9046FF'
}

export const enum Emojis {
	rCheck = '',
	rCross = '',
	rArrowLeft = '',
	rArrowRight = '',
	rArrowToLeft = '',
	rArrowToRight = '',
	rInfo = '',
	rList = '',
	rOnline = '',
	rIdle = '',
	rDnd = '',
	rOffline = '',
	rBotBadge = '',
	rDiscordPartner = '',
	rDiscordVerified = ''
}

export const CLIENT_OPTIONS: ClientOptions = {
	i18n: {
		defaultMissingKey: 'missingKey',
		defaultNS: 'global',
		i18next: {
			preload: ['en-US'],
			load: 'all',
			fallbackLng: 'en-US',
			initImmediate: false,
			returnObjects: true,
			interpolation: {
				escapeValue: false,
				defaultVariables: {
					rCheck: `<:emojiname:${Emojis.rCheck}>`,
					rCross: `<:emojiname:${Emojis.rCross}>`
				},
				format: (value: unknown, format?: string, lng?: string) => {
					switch (format as RTByteFormatters) {
						case RTByteFormatters.AndList: {
							return list(value as string[], i18next.t('global:and', { lng }));
						}
						case RTByteFormatters.OrList: {
							return list(value as string[], i18next.t('global:or', { lng }));
						}
						case RTByteFormatters.Permissions: {
							return i18next.t(`permissions:${value}`, { lng });
						}
						default:
							return value as string;
					}
				}
			}
		}
	}
};

export const REGEX = {
	emoji: /^(?:<a?:\w{2,32}:)?(\d{17,19})>?$/,
	emojiAnimated: /^<a:(?:\w{2,32}:)?(\d{17,19})>?$/
};
