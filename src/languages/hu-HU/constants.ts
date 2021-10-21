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
			name: 'hu-HU',
			duration: {
				[TimeTypes.Year]: {
					DEFAULT: 'év'
				},
				[TimeTypes.Month]: {
					DEFAULT: 'hónap'
				},
				[TimeTypes.Week]: {
					DEFAULT: 'hét'
				},
				[TimeTypes.Day]: {
					DEFAULT: 'nap'
				},
				[TimeTypes.Hour]: {
					DEFAULT: 'óra'
				},
				[TimeTypes.Minute]: {
					DEFAULT: 'perc'
				},
				[TimeTypes.Second]: {
					DEFAULT: 'másodperc'
				}
			}
		});
	}

	public ordinal(cardinal: number): string {
		return `${cardinal}.`;
	}
}
