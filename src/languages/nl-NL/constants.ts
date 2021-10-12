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
