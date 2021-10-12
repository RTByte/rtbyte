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
			name: 'tr-TR',
			duration: {
				[TimeTypes.Year]: {
					DEFAULT: 'yıl'
				},
				[TimeTypes.Month]: {
					DEFAULT: 'ay'
				},
				[TimeTypes.Week]: {
					DEFAULT: 'hafta'
				},
				[TimeTypes.Day]: {
					DEFAULT: 'gün'
				},
				[TimeTypes.Hour]: {
					DEFAULT: 'saat'
				},
				[TimeTypes.Minute]: {
					DEFAULT: 'dakika'
				},
				[TimeTypes.Second]: {
					DEFAULT: 'saniye'
				}
			}
		});
	}

	public ordinal(cardinal: number): string {
		return `${cardinal}.`;
	}
}
