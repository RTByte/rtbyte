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
			name: 'fi-FI',
			duration: {
				[TimeTypes.Year]: {
					1: 'vuosi',
					DEFAULT: 'vuotta'
				},
				[TimeTypes.Month]: {
					1: 'kuukausi',
					DEFAULT: 'kuukautta'
				},
				[TimeTypes.Week]: {
					1: 'viikko',
					DEFAULT: 'viikkoa'
				},
				[TimeTypes.Day]: {
					1: 'päivä',
					DEFAULT: 'päivää'
				},
				[TimeTypes.Hour]: {
					1: 'tunti',
					DEFAULT: 'tuntia'
				},
				[TimeTypes.Minute]: {
					1: 'minuutti',
					DEFAULT: 'minuuttia'
				},
				[TimeTypes.Second]: {
					1: 'sekunti',
					DEFAULT: 'sekuntia'
				}
			}
		});
	}

	public ordinal(cardinal: number): string {
		return `${cardinal}.`;
	}
}
