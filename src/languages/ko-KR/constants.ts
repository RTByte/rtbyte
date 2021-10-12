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
			name: 'ko-KR',
			duration: {
				[TimeTypes.Year]: {
					DEFAULT: '년'
				},
				[TimeTypes.Month]: {
					DEFAULT: '개월'
				},
				[TimeTypes.Week]: {
					DEFAULT: '주'
				},
				[TimeTypes.Day]: {
					DEFAULT: '일'
				},
				[TimeTypes.Hour]: {
					DEFAULT: '시간'
				},
				[TimeTypes.Minute]: {
					DEFAULT: '분'
				},
				[TimeTypes.Second]: {
					DEFAULT: '초'
				}
			}
		});
	}

	public ordinal(cardinal: number): string {
		return `제 ${cardinal}`;
	}
}
