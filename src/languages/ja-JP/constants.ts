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
			name: 'ja-JP',
			duration: {
				[TimeTypes.Year]: {
					DEFAULT: '年'
				},
				[TimeTypes.Month]: {
					DEFAULT: 'ヶ月'
				},
				[TimeTypes.Week]: {
					DEFAULT: '週間'
				},
				[TimeTypes.Day]: {
					DEFAULT: '日'
				},
				[TimeTypes.Hour]: {
					DEFAULT: '時間'
				},
				[TimeTypes.Minute]: {
					DEFAULT: '分'
				},
				[TimeTypes.Second]: {
					DEFAULT: '秒'
				}
			}
		});
	}

	public ordinal(cardinal: number): string {
		return `${cardinal}番目`;
	}
}
