/* eslint-disable @typescript-eslint/naming-convention */
import { FirestoreManager } from '@lib/structures/FirestoreManager';

declare module 'discord.js' {
	interface Client {
		readonly firestore: FirestoreManager;
	}
}
