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
			name: 'sv-SE',
			duration: {
				[TimeTypes.Year]: {
					1: 'år',
					DEFAULT: 'år'
				},
				[TimeTypes.Month]: {
					1: 'månad',
					DEFAULT: 'månader'
				},
				[TimeTypes.Week]: {
					1: 'vecka',
					DEFAULT: 'veckor'
				},
				[TimeTypes.Day]: {
					1: 'dag',
					DEFAULT: 'dagar'
				},
				[TimeTypes.Hour]: {
					1: 'timme',
					DEFAULT: 'timmar'
				},
				[TimeTypes.Minute]: {
					1: 'minut',
					DEFAULT: 'minuter'
				},
				[TimeTypes.Second]: {
					1: 'sekund',
					DEFAULT: 'sekunder'
				}
			}
		});
	}

	public ordinal(cardinal: number): string {
		const cent = cardinal % 100;
		const dec = cardinal % 10;

		if (cent >= 10 && cent <= 20) {
			return `${cardinal}:e`;
		}

		switch (dec) {
			case 1:
				return `${cardinal}:a`;
			case 2:
				return `${cardinal}:a`;
			default:
				return `${cardinal}:e`;
		}
	}
}
