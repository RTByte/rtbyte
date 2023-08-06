import { TOKENS } from '#root/config';
import { initClean } from '#utils/Sanitizer/clean';
import { isNullishOrEmpty } from '@sapphire/utilities';

const secrets = new Set<string>();

for (const [value] of Object.entries(TOKENS)) {
	if (isNullishOrEmpty(value)) continue;

	secrets.add(value);
}

initClean([...secrets]);
