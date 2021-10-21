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
			name: 'it-IT',
			duration: {
				[TimeTypes.Year]: {
					1: 'anno',
					DEFAULT: 'anni'
				},
				[TimeTypes.Month]: {
					1: 'mese',
					DEFAULT: 'mesi'
				},
				[TimeTypes.Week]: {
					1: 'settimana',
					DEFAULT: 'settimane'
				},
				[TimeTypes.Day]: {
					1: 'giorno',
					DEFAULT: 'giorni'
				},
				[TimeTypes.Hour]: {
					1: 'ora',
					DEFAULT: 'ore'
				},
				[TimeTypes.Minute]: {
					1: 'minuto',
					DEFAULT: 'minuti'
				},
				[TimeTypes.Second]: {
					1: 'secondo',
					DEFAULT: 'secondi'
				}
			}
		});
	}

	public ordinal(cardinal: number): string {
		return `${cardinal}º`;
	}
}
