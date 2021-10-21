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
			name: 'da-DK',
			duration: {
				[TimeTypes.Year]: {
					DEFAULT: 'år'
				},
				[TimeTypes.Month]: {
					1: 'måned',
					DEFAULT: 'måneder'
				},
				[TimeTypes.Week]: {
					1: 'uge',
					DEFAULT: 'uger'
				},
				[TimeTypes.Day]: {
					1: 'dag',
					DEFAULT: 'dage'
				},
				[TimeTypes.Hour]: {
					1: 'time',
					DEFAULT: 'timer'
				},
				[TimeTypes.Minute]: {
					1: 'minut',
					DEFAULT: 'minutter'
				},
				[TimeTypes.Second]: {
					1: 'sekund',
					DEFAULT: 'sekunder'
				}
			}
		});
	}

	public ordinal(cardinal: number): string {
		return `${cardinal}.`;
	}
}
