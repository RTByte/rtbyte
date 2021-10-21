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
			name: 'lt-LT',
			duration: {
				[TimeTypes.Year]: {
					DEFAULT: 'metai'
				},
				[TimeTypes.Month]: {
					1: 'mėnuo',
					DEFAULT: 'mėnesiai'
				},
				[TimeTypes.Week]: {
					1: 'savaitė',
					DEFAULT: 'savaitės'
				},
				[TimeTypes.Day]: {
					1: 'diena',
					DEFAULT: 'dienos'
				},
				[TimeTypes.Hour]: {
					1: 'valandą',
					DEFAULT: 'valandos'
				},
				[TimeTypes.Minute]: {
					1: 'minutę',
					DEFAULT: 'minutės'
				},
				[TimeTypes.Second]: {
					1: 'sekundė',
					DEFAULT: 'sekundes'
				}
			}
		});
	}

	public ordinal(cardinal: number): string {
		return `${cardinal}-as`;
	}
}
