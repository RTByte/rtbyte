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
			name: 'ro-RO',
			duration: {
				[TimeTypes.Year]: {
					1: 'an',
					DEFAULT: 'ani'
				},
				[TimeTypes.Month]: {
					1: 'lună',
					DEFAULT: 'luni'
				},
				[TimeTypes.Week]: {
					1: 'săptămână',
					DEFAULT: 'săptămâni'
				},
				[TimeTypes.Day]: {
					1: 'zi',
					DEFAULT: 'zile'
				},
				[TimeTypes.Hour]: {
					1: 'oră',
					DEFAULT: 'ore'
				},
				[TimeTypes.Minute]: {
					1: 'minut',
					DEFAULT: 'minute'
				},
				[TimeTypes.Second]: {
					1: 'secundă',
					DEFAULT: 'secunde'
				}
			}
		});
	}

	public ordinal(cardinal: number): string {
		if (cardinal === 1) return 'Primul';
		return `${cardinal}lea`;
	}
}
