/**
 * @license Apache License 2.0
 * @copyright 2019 Skyra Project
 * Modified for use in this project.
 */

import { Handler } from '#lib/i18n/structures/Handler';
import { TimeTypes } from '@sapphire/time-utilities';

export class ExtendedHandler extends Handler {
	public constructor() {
		super({
			name: 'zh-CN',
			duration: {
				[TimeTypes.Year]: {
					DEFAULT: '年'
				},
				[TimeTypes.Month]: {
					DEFAULT: '个月'
				},
				[TimeTypes.Week]: {
					DEFAULT: '周'
				},
				[TimeTypes.Day]: {
					DEFAULT: '天'
				},
				[TimeTypes.Hour]: {
					DEFAULT: '小时'
				},
				[TimeTypes.Minute]: {
					DEFAULT: '分钟'
				},
				[TimeTypes.Second]: {
					DEFAULT: '秒'
				}
			}
		});
	}

	public ordinal(cardinal: number): string {
		return `第${cardinal}`;
	}
}
