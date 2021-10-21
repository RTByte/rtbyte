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
