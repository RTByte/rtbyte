/**
 * @license Apache License 2.0
 * @copyright 2019 Skyra Project
 * Modified for use in this project.
 */

import { Handler } from '#lib/i18n/structures/Handler';
import { TimeTypes } from '@sapphire/time-utilities';

export class ExtendedHandler extends Handler {
	public constructor() {
		super({
			name: 'uk-UA',
			duration: {
				[TimeTypes.Year]: {
					1: 'рік',
					DEFAULT: 'роки'
				},
				[TimeTypes.Month]: {
					1: 'місяць',
					DEFAULT: 'місяці'
				},
				[TimeTypes.Week]: {
					1: 'тиждень',
					DEFAULT: 'тижні'
				},
				[TimeTypes.Day]: {
					1: 'день',
					DEFAULT: 'дні'
				},
				[TimeTypes.Hour]: {
					1: 'година',
					DEFAULT: 'години'
				},
				[TimeTypes.Minute]: {
					1: 'хвилина',
					DEFAULT: 'хвилини'
				},
				[TimeTypes.Second]: {
					1: 'секунда',
					DEFAULT: 'секунди'
				}
			}
		});
	}

	public ordinal(cardinal: number): string {
		return `${cardinal}-й`;
	}
}
