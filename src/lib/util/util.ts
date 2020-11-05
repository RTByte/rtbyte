import { RTByteClient } from '@lib/RTByteClient';
import { Events } from '@sapphire/framework';
import humanizeDuration from 'humanize-duration';
import { isThenable } from '@sapphire/utilities';

export const duration = (ms: number) => humanizeDuration(ms, { largest: 2, round: true });

export const urlEncodeString = (str: string) => str.replace(/[ ]/g, '%20')
	   .replace(/["]/g, '%22')
	   .replace(/[+]/g, '%2B')
	   .replace(/[,]/g, '%2C')
	   .replace(/[<]/g, '%3C')
	   .replace(/[>]/g, '%3E')
	   .replace(/[#]/g, '%23')
	   .replace(/[|]/g, '%7C');

/**
 * @copyright 2019-2020 Antonio Román
 * @license Apache-2.0
 */
export function floatPromise(ctx: { client: RTByteClient }, promise: Promise<unknown>) {
	if (isThenable(promise)) promise.catch(error => ctx.client.emit(Events.Error, error));
}

export const mainTest = () => 'this builds and pushes';
