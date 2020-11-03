import 'module-alias/register';
import 'reflect-metadata';
import { RTByteClient } from '@lib/RTByteClient';
import { TOKENS, CLIENT_OPTIONS } from '@root/config';
import { floatPromise } from '@lib/util/util';

const client = new RTByteClient(CLIENT_OPTIONS);

async function main() {
	await client.login(TOKENS.BOT_TOKEN).catch(error => {
		client.logger.error(error);
	});
}

floatPromise({ client }, main());
