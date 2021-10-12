/*
The code in this file is licensed under the Apache License,
Version 2.0 (the "License"); with the original authors being part of the
Skyra Project (https://github.com/skyra-project/skyra) team.
*/

import { Handler } from '#lib/i18n/structures/Handler';
import { TimeTypes } from '@sapphire/time-utilities';

export class ExtendedHandler extends Handler {
	public constructor() {
		super({
			name: 'fr-FR',
			duration: {
				[TimeTypes.Year]: {
					1: 'an',
					DEFAULT: 'ans'
				},
				[TimeTypes.Month]: {
					1: 'mois',
					DEFAULT: 'mois'
				},
				[TimeTypes.Week]: {
					1: 'semaine',
					DEFAULT: 'semaines'
				},
				[TimeTypes.Day]: {
					1: 'jour',
					DEFAULT: 'jours'
				},
				[TimeTypes.Hour]: {
					1: 'heure',
					DEFAULT: 'heures'
				},
				[TimeTypes.Minute]: {
					1: 'minute',
					DEFAULT: 'minutes'
				},
				[TimeTypes.Second]: {
					1: 'seconde',
					DEFAULT: 'secondes'
				}
			}
		});
	}

	public ordinal(cardinal: number): string {
		const dec = cardinal % 10;

		switch (dec) {
			case 1:
				return `${cardinal}er`;
			default:
				return `${cardinal}e`;
		}
	}
}
