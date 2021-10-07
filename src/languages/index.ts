/*
The code in this file is licensed under the Apache License,
Version 2.0 (the "License"); with the original authors being part of the
Skyra Project (https://github.com/skyra-project/skyra) team.
*/

import type { Handler } from '#lib/i18n/structures/Handler';
import { ExtendedHandler as EnUsHandler } from './en-US/constants';

export const handlers = new Map<string, Handler>([
	['en-US', new EnUsHandler()],
]);

export function getHandler(name: string): Handler {
	return handlers.get(name) ?? handlers.get('en-US')!;
}
