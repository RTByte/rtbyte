// Copyright (c) 2017-2019 dirigeants. All rights reserved. MIT license. Modified by Michael Cumbers & Rasmus Gerdin for use in RTByte.
const { Command, RichDisplay } = require('klasa');
const { MessageEmbed } = require('discord.js');
const { ModCase } = require('../../index');
const { Colors, Emojis } = require('../../lib/util/constants');

const timeout = 1000 * 60 * 3;

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['history', 'case'],
			permissionLevel: 6,
			requiredPermissions: ['ADD_REACTIONS', 'USE_EXTERNAL_EMOJIS', 'SEND_MESSAGES', 'MANAGE_MESSAGES', 'EMBED_LINKS'],
			runIn: ['text'],
			description: language => language.get('COMMAND_MODHISTORY_DESCRIPTION'),
			usage: '[target:membername] [caseID:string]',
			usageDelim: ' '
		});

		// Cache the handlers
		this.handlers = new Map();
	}

	async run(msg, [target, caseID = null]) {
		const serverCases = this.client.settings.get('moderation.cases').filter(modCase => modCase.guild === msg.guild.id);

		if (caseID) {
			if (!this.client.settings.get('moderation.cases').find(thisCase => thisCase.id === caseID)) return msg.reject(msg.language.get('COMMAND_MODHISTORY_INVALID_CASEID', caseID));

			const modCase = new ModCase(msg.guild);
			await modCase.unpack(this.client.settings.get('moderation.cases').find(thisCase => thisCase.id === caseID));

			return msg.send('', { embed: await modCase.embed() });
		}

		if (target) {
			const targetCases = serverCases.filter(modCase => modCase.user === target.user.id);
			if (!targetCases.length) return msg.affirm(msg.language.get('COMMAND_MODHISTORY_NOMODHISTORY', target));

			const previousHandler = this.handlers.get(msg.author.id);
			if (previousHandler) previousHandler.stop();
			const caseEmbedArray = await this.buildEmbedArray(msg, targetCases);

			const loadingEmbed = new MessageEmbed()
				.setTitle(msg.language.get('COMMAND_MODHISTORY_LOADING'))
				.setColor(Colors.white)
				.setThumbnail(target.user.displayAvatarURL(), 50, 50)
				.setTimestamp();

			const handler = await (await this.buildDisplay(caseEmbedArray)).run(await msg.send('', { embed: loadingEmbed }), {
				filter: (reaction, user) => user.id === msg.author.id,
				timeout
			});

			handler.on('end', () => this.handlers.delete(msg.author.id));
			this.handlers.set(msg.author.id, handler);
			return handler;
		} else {
			if (!serverCases.length) return msg.affirm(msg.language.get('COMMAND_MODHISTORY_NOMODHISTORY', msg.guild.name));

			const previousHandler = this.handlers.get(msg.author.id);
			if (previousHandler) previousHandler.stop();
			const caseEmbedArray = await this.buildEmbedArray(msg, serverCases);

			const loadingEmbed = new MessageEmbed()
				.setTitle(msg.language.get('COMMAND_MODHISTORY_LOADING'))
				.setColor(Colors.white)
				.setThumbnail(msg.guild.iconURL(), 50, 50)
				.setTimestamp();

			const handler = await (await this.buildDisplay(caseEmbedArray)).run(await msg.send('', { embed: loadingEmbed }), {
				filter: (reaction, user) => user.id === msg.author.id,
				timeout
			});

			handler.on('end', () => this.handlers.delete(msg.author.id));
			this.handlers.set(msg.author.id, handler);
			return handler;
		}
	}


	async buildEmbedArray(msg, cases) {
		const caseEmbedArray = [];
		for (const cse of cases) {
			const modCase = new ModCase(msg.guild);
			await modCase.unpack(cases.find(thisCase => thisCase.id === cse.id));

			caseEmbedArray.push(await modCase.embed());
		}
		caseEmbedArray.reverse();
		return caseEmbedArray;
	}

	async buildDisplay(caseEmbedArray) {
		const arrowToLeftEmoji = this.client.emojis.cache.get(Emojis.arrowToLeft);
		const arrowLeftEmoji = this.client.emojis.cache.get(Emojis.arrowLeft);
		const arrowRightEmoji = this.client.emojis.cache.get(Emojis.arrowRight);
		const arrowToRightEmoji = this.client.emojis.cache.get(Emojis.arrowToRight);
		const rejectEmoji = this.client.emojis.cache.get(Emojis.reject);
		const listEmoji = this.client.emojis.cache.get(Emojis.list);
		const display = new RichDisplay()
			.setEmojis({
				first: arrowToLeftEmoji.id,
				back: arrowLeftEmoji.id,
				forward: arrowRightEmoji.id,
				last: arrowToRightEmoji.id,
				stop: rejectEmoji.id,
				jump: listEmoji.id
			});
		for (const caseEmbed of caseEmbedArray) {
			display.addPage(caseEmbed);
		}

		return display;
	}

};
