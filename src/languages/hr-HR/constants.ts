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
			name: 'hr-HR',
			duration: {
				[TimeTypes.Year]: {
					1: 'godina',
					DEFAULT: 'godine'
				},
				[TimeTypes.Month]: {
					1: 'mjesec',
					DEFAULT: 'mjeseca'
				},
				[TimeTypes.Week]: {
					1: 'tjedan',
					DEFAULT: 'tjedna'
				},
				[TimeTypes.Day]: {
					1: 'dan',
					DEFAULT: 'dana'
				},
				[TimeTypes.Hour]: {
					1: 'sat',
					DEFAULT: 'sata'
				},
				[TimeTypes.Minute]: {
					1: 'minuta',
					DEFAULT: 'minute'
				},
				[TimeTypes.Second]: {
					1: 'sekunda',
					DEFAULT: 'sekunde'
				}
			}
		});
	}

	public ordinal(cardinal: number): string {
		return `${cardinal}.`;
	}
}
