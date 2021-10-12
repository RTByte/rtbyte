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
			name: 'ru-RU',
			duration: {
				[TimeTypes.Year]: {
					1: 'год',
					DEFAULT: 'года'
				},
				[TimeTypes.Month]: {
					1: 'месяц',
					DEFAULT: 'месяца'
				},
				[TimeTypes.Week]: {
					1: 'неделя',
					DEFAULT: 'недели'
				},
				[TimeTypes.Day]: {
					1: 'день',
					DEFAULT: 'дня'
				},
				[TimeTypes.Hour]: {
					1: 'час',
					DEFAULT: 'часа'
				},
				[TimeTypes.Minute]: {
					1: 'минута',
					DEFAULT: 'минуты'
				},
				[TimeTypes.Second]: {
					1: 'секунда',
					DEFAULT: 'секунды'
				}
			}
		});
	}

	public ordinal(cardinal: number): string {
		return `${cardinal}-й`;
	}
}
