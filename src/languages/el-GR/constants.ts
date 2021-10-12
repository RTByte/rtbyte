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
			name: 'el-GR',
			duration: {
				[TimeTypes.Year]: {
					1: 'χρόνος',
					DEFAULT: 'χρόνια'
				},
				[TimeTypes.Month]: {
					1: 'μήνα',
					DEFAULT: 'μήνες'
				},
				[TimeTypes.Week]: {
					1: 'εβδομάδα',
					DEFAULT: 'εβδομάδες'
				},
				[TimeTypes.Day]: {
					1: 'μέρα',
					DEFAULT: 'μέρες'
				},
				[TimeTypes.Hour]: {
					1: 'ώρα',
					DEFAULT: 'ώρες'
				},
				[TimeTypes.Minute]: {
					1: 'λεπτό',
					DEFAULT: 'λεπτά'
				},
				[TimeTypes.Second]: {
					1: 'δευτερόλεπτο',
					DEFAULT: 'δευτερόλεπτα'
				}
			}
		});
	}

	public ordinal(cardinal: number): string {
		return `${cardinal}η`;
	}
}
