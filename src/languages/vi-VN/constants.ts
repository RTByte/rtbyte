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
