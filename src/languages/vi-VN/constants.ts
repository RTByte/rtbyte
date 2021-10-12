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
			name: 'vi-VN',
			duration: {
				[TimeTypes.Year]: {
					DEFAULT: 'năm'
				},
				[TimeTypes.Month]: {
					DEFAULT: 'tháng'
				},
				[TimeTypes.Week]: {
					DEFAULT: 'tuần'
				},
				[TimeTypes.Day]: {
					DEFAULT: 'ngày'
				},
				[TimeTypes.Hour]: {
					DEFAULT: 'giờ'
				},
				[TimeTypes.Minute]: {
					DEFAULT: 'phút'
				},
				[TimeTypes.Second]: {
					DEFAULT: 'giây'
				}
			}
		});
	}

	public ordinal(cardinal: number): string {
		return `Thứ ${cardinal}`;
	}
}
