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
			name: 'hu-HU',
			duration: {
				[TimeTypes.Year]: {
					DEFAULT: 'év'
				},
				[TimeTypes.Month]: {
					DEFAULT: 'hónap'
				},
				[TimeTypes.Week]: {
					DEFAULT: 'hét'
				},
				[TimeTypes.Day]: {
					DEFAULT: 'nap'
				},
				[TimeTypes.Hour]: {
					DEFAULT: 'óra'
				},
				[TimeTypes.Minute]: {
					DEFAULT: 'perc'
				},
				[TimeTypes.Second]: {
					DEFAULT: 'másodperc'
				}
			}
		});
	}

	public ordinal(cardinal: number): string {
		return `${cardinal}.`;
	}
}
