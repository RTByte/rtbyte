/*
The code in this file is licensed under the Apache License,
Version 2.0 (the "License"); with the original authors being part of the
Skyra Project (https://github.com/skyra-project/skyra) team.
*/

// TODO: Remove this when TS types Intl.ListFormat
declare namespace Intl {
	interface DateTimeFormatOptions {
		dateStyle?: 'full' | 'long' | 'medium' | 'short';
		timeStyle?: 'full' | 'long' | 'medium' | 'short';
	}

	class ListFormat {
		public constructor(locales: string | string[], options?: ListFormatOptions);
		public format(values: Iterable<string>): string;
		public formatToParts(values: readonly string[]): ListFormatPart[];
		public static supportedLocalesOf(locales: string | string[], options?: ListFormatOptions): string[];
	}

	interface ListFormatOptions {
		localeMatcher?: 'lookup' | 'best fit';
		type?: 'conjunction' | 'disjunction' | 'unit';
		style?: 'long' | 'short' | 'narrow';
	}

	interface ListFormatPart {
		type: 'element' | 'literal';
		value: string;
	}
}
