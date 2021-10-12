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
			name: 'th-TH',
			duration: {
				[TimeTypes.Year]: {
					DEFAULT: 'ปี'
				},
				[TimeTypes.Month]: {
					DEFAULT: 'เดือน'
				},
				[TimeTypes.Week]: {
					DEFAULT: 'สัปดาห์'
				},
				[TimeTypes.Day]: {
					DEFAULT: 'วัน'
				},
				[TimeTypes.Hour]: {
					DEFAULT: 'ชั่วโมง'
				},
				[TimeTypes.Minute]: {
					DEFAULT: 'นาที'
				},
				[TimeTypes.Second]: {
					DEFAULT: 'วินาที'
				}
			}
		});
	}

	public ordinal(cardinal: number): string {
		return `ที่ ${cardinal}`;
	}
}
