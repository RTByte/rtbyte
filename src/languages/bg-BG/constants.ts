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
			name: 'bg-BG',
			duration: {
				[TimeTypes.Year]: {
					1: 'година',
					DEFAULT: 'години'
				},
				[TimeTypes.Month]: {
					1: 'месец',
					DEFAULT: 'месеци'
				},
				[TimeTypes.Week]: {
					1: 'седмица',
					DEFAULT: 'седмици'
				},
				[TimeTypes.Day]: {
					1: 'ден',
					DEFAULT: 'дни'
				},
				[TimeTypes.Hour]: {
					1: 'час',
					DEFAULT: 'часа'
				},
				[TimeTypes.Minute]: {
					1: 'минута',
					DEFAULT: 'минути'
				},
				[TimeTypes.Second]: {
					1: 'секунда',
					DEFAULT: 'секунди'
				}
			}
		});
	}

	public ordinal(cardinal: number): string {
		const dec = cardinal % 10;

		switch (dec) {
			case 1:
				return `${cardinal}рви`;
			case 2:
				return `${cardinal}ори`;
			case 4:
				return `${cardinal}рти`;
			case 6:
				return `${cardinal}сти`;
			case 7:
				return `${cardinal}дми`;
			case 8:
				return `${cardinal}cми`;
			default:
				return `${cardinal}eти`;
		}
	}
}
