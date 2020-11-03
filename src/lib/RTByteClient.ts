/* eslint-disable @typescript-eslint/naming-convention */
import { FirestoreManager } from './structures/FirestoreManager';
import { PREFIX } from '@root/config';
import { SapphireClient } from '@sapphire/framework';
import { mergeDefault } from '@sapphire/utilities';
import { CLIENT_OPTIONS as CLIENT_OPTIONS_BASE } from '@lib/util/constants';
import { FirestoreCollections, RTByteLanguages } from './types/Types';
import type { ClientOptions, Message } from 'discord.js';

import '@scp/in17n/register';

export class RTByteClient extends SapphireClient {

	public readonly firestore: FirestoreManager;

	public constructor(options?: ClientOptions) {
		// @ts-expect-error Type instantiation is excessively deep and possibly infinite. ts(2589)
		super(mergeDefault(CLIENT_OPTIONS_BASE, options));

		this.firestore = new FirestoreManager();

		this.fetchPrefix = (message: Message) => message.guild ? this.firestore.get(FirestoreCollections.Guilds, message.guild.id).then(data => data.prefix) : PREFIX;
		this.fetchLanguage = (message: Message) => message.guild ? this.firestore.get(FirestoreCollections.Guilds, message.guild.id).then(data => data.lang) : RTByteLanguages.EnUs;

		this.registerUserDirectories();
	}

}
