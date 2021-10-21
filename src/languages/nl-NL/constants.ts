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
			name: 'nl-NL',
			duration: {
				[TimeTypes.Year]: {
					DEFAULT: 'jaar'
				},
				[TimeTypes.Month]: {
					1: 'maand',
					DEFAULT: 'maanden'
				},
				[TimeTypes.Week]: {
					1: 'week',
					DEFAULT: 'weken'
				},
				[TimeTypes.Day]: {
					1: 'dag',
					DEFAULT: 'dagen'
				},
				[TimeTypes.Hour]: {
					DEFAULT: 'uur'
				},
				[TimeTypes.Minute]: {
					1: 'minuut',
					DEFAULT: 'minuten'
				},
				[TimeTypes.Second]: {
					1: 'seconde',
					DEFAULT: 'seconden'
				}
			}
		});
	}

	public ordinal(cardinal: number): string {
		return `${cardinal}e`;
	}
}
