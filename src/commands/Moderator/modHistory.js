// Copyright (c) 2017-2019 dirigeants. All rights reserved. MIT license. Modified by Michael Cumbers & Rasmus Gerdin for use in RTByte.
const { Command, RichDisplay } = require('klasa');
const Case = require('../../lib/structures/Case');

const timeout = 1000 * 60 * 3;

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['history', 'case'],
			permissionLevel: 5,
			requiredPermissions: ['ADD_REACTIONS', 'USE_EXTERNAL_EMOJIS', 'SEND_MESSAGES', 'MANAGE_MESSAGES', 'EMBED_LINKS'],
			runIn: ['text'],
			description: language => language.get('COMMAND_MODHISTORY_DESCRIPTION'),
			usage: '[target:member] [caseID:string]',
			usageDelim: ' '
		});

		// Cache the handlers
		this.handlers = new Map();
	}

	async run(msg, [target = msg.member, caseID = null]) {
		if (caseID) {
			if (!this.client.settings.moderation.cases.find(thisCase => thisCase.id === caseID)) return msg.reject(`${caseID} is not a valid Case ID`);

			const modCase = new Case(msg.guild);
			await modCase.unpack(this.client.settings.moderation.cases.find(thisCase => thisCase.id === caseID));

			return msg.send('', { embed: await modCase.embed() });
		}

		if (!target.settings.moderation.cases.length) return msg.affirm(`${target} has no recorded moderation history.`);

		const previousHandler = this.handlers.get(msg.author.id);
		if (previousHandler) previousHandler.stop();
		const caseEmbedArray = await this.buildEmbedArray(msg, target);

		const handler = await (await this.buildDisplay(caseEmbedArray)).run(await msg.send('Loading moderation history...'), {
			filter: (reaction, user) => user.id === msg.author.id,
			timeout
		});

		handler.on('end', () => this.handlers.delete(msg.author.id));
		this.handlers.set(msg.author.id, handler);
		return handler;
	}

	async buildEmbedArray(msg, target) {
		const caseEmbedArray = [];
		for await (const caseID of target.settings.moderation.cases) {
			const modCase = new Case(msg.guild);
			await modCase.unpack(this.client.settings.moderation.cases.find(thisCase => thisCase.id === caseID));

			caseEmbedArray.push(await modCase.embed());
		}
		return caseEmbedArray;
	}

	async buildDisplay(caseEmbedArray) {
		const arrowToLeftEmoji = this.client.emojis.get(this.client.settings.emoji.arrowToLeft);
		const arrowLeftEmoji = this.client.emojis.get(this.client.settings.emoji.arrowLeft);
		const arrowRightEmoji = this.client.emojis.get(this.client.settings.emoji.arrowRight);
		const arrowToRightEmoji = this.client.emojis.get(this.client.settings.emoji.arrowToRight);
		const rejectEmoji = this.client.emojis.get(this.client.settings.emoji.reject);
		const listEmoji = this.client.emojis.get(this.client.settings.emoji.list);
		const display = new RichDisplay()
			.setEmojis({
				first: arrowToLeftEmoji.id,
				back: arrowLeftEmoji.id,
				forward: arrowRightEmoji.id,
				last: arrowToRightEmoji.id,
				stop: rejectEmoji.id,
				jump: listEmoji.id
			});
		for await (const caseEmbed of caseEmbedArray) {
			display.addPage(caseEmbed);
		}

		return display;
	}

};
