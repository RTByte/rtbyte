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
			name: 'tr-TR',
			duration: {
				[TimeTypes.Year]: {
					DEFAULT: 'yıl'
				},
				[TimeTypes.Month]: {
					DEFAULT: 'ay'
				},
				[TimeTypes.Week]: {
					DEFAULT: 'hafta'
				},
				[TimeTypes.Day]: {
					DEFAULT: 'gün'
				},
				[TimeTypes.Hour]: {
					DEFAULT: 'saat'
				},
				[TimeTypes.Minute]: {
					DEFAULT: 'dakika'
				},
				[TimeTypes.Second]: {
					DEFAULT: 'saniye'
				}
			}
		});
	}

	public ordinal(cardinal: number): string {
		return `${cardinal}.`;
	}
}
