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
