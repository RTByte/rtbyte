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
			name: 'hi-IN',
			duration: {
				[TimeTypes.Year]: {
					1: 'वर्ष',
					DEFAULT: 'साल'
				},
				[TimeTypes.Month]: {
					1: 'महीना',
					DEFAULT: 'महीने'
				},
				[TimeTypes.Week]: {
					DEFAULT: 'सप्ताह'
				},
				[TimeTypes.Day]: {
					DEFAULT: 'दिन'
				},
				[TimeTypes.Hour]: {
					1: 'घंटा',
					DEFAULT: 'घंटे'
				},
				[TimeTypes.Minute]: {
					DEFAULT: 'मिनट'
				},
				[TimeTypes.Second]: {
					DEFAULT: 'सेकेंड'
				}
			}
		});
	}

	public ordinal(cardinal: number): string {
		return `${cardinal}वीं`;
	}
}
