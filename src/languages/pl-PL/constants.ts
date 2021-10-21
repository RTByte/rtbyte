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
			name: 'pl-PL',
			duration: {
				[TimeTypes.Year]: {
					1: 'rok',
					DEFAULT: 'lata'
				},
				[TimeTypes.Month]: {
					1: 'miesiąc',
					DEFAULT: 'miesiące'
				},
				[TimeTypes.Week]: {
					1: 'tydzień',
					DEFAULT: 'tygodnie'
				},
				[TimeTypes.Day]: {
					1: 'dzień',
					DEFAULT: 'dni'
				},
				[TimeTypes.Hour]: {
					1: 'godzina',
					DEFAULT: 'godziny'
				},
				[TimeTypes.Minute]: {
					1: 'minuta',
					DEFAULT: 'minuty'
				},
				[TimeTypes.Second]: {
					1: 'sekunda',
					DEFAULT: 'sekundy'
				}
			}
		});
	}

	public ordinal(cardinal: number): string {
		return `${cardinal}.`;
	}
}
