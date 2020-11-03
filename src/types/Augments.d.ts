/* eslint-disable @typescript-eslint/naming-convention */
import type { FirestoreManager } from '@lib/structures/FirestoreManager';

declare module 'discord.js' {
	interface Client {
		readonly firestore: FirestoreManager;
	}
}
