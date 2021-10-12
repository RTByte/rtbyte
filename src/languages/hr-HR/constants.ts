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
