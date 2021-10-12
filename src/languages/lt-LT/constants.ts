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
			name: 'lt-LT',
			duration: {
				[TimeTypes.Year]: {
					DEFAULT: 'metai'
				},
				[TimeTypes.Month]: {
					1: 'mėnuo',
					DEFAULT: 'mėnesiai'
				},
				[TimeTypes.Week]: {
					1: 'savaitė',
					DEFAULT: 'savaitės'
				},
				[TimeTypes.Day]: {
					1: 'diena',
					DEFAULT: 'dienos'
				},
				[TimeTypes.Hour]: {
					1: 'valandą',
					DEFAULT: 'valandos'
				},
				[TimeTypes.Minute]: {
					1: 'minutę',
					DEFAULT: 'minutės'
				},
				[TimeTypes.Second]: {
					1: 'sekundė',
					DEFAULT: 'sekundes'
				}
			}
		});
	}

	public ordinal(cardinal: number): string {
		return `${cardinal}-as`;
	}
}
