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
