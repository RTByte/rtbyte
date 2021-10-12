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
			name: 'cs-CZ',
			duration: {
				[TimeTypes.Year]: {
					1: 'rok',
					DEFAULT: 'roky'
				},
				[TimeTypes.Month]: {
					1: 'měsíc',
					DEFAULT: 'měsíce'
				},
				[TimeTypes.Week]: {
					1: 'týden',
					DEFAULT: 'týdny'
				},
				[TimeTypes.Day]: {
					1: 'den',
					DEFAULT: 'dny'
				},
				[TimeTypes.Hour]: {
					1: 'hodina',
					DEFAULT: 'hodiny'
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
