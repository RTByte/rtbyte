// Copyright (c) 2017-2019 dirigeants. All rights reserved. MIT license. Modified by Michael Cumbers & Rasmus Gerdin for use in RTByte.
const { Command, RichDisplay } = require('klasa');
const { MessageEmbed } = require('discord.js');
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
			if (!(this.client.settings.moderation.cases.find(thisCase => thisCase.id === caseID))) return msg.reject(`${caseID} is not a valid Case ID`);

			const modCase = new Case(msg.guild);
			await modCase.unpack(this.client.settings.moderation.cases.find(thisCase => thisCase.id === caseID));
			
			const caseEmbed = await this.buildEmbed(modCase);
			return msg.send('', { embed: caseEmbed });
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
			const caseEmbed = await this.buildEmbed(modCase);
			caseEmbedArray.push(caseEmbed);
		}
		return caseEmbedArray;
	}

	// eslint-disable-next-line complexity
	async buildEmbed(modCase) {
		const caseEmbed = new MessageEmbed()
			.setAuthor(modCase.guild.language.get(`MODERATION_LOG_${modCase.type.toUpperCase()}:`))
			.setTitle(`${modCase.user.tag} | (${modCase.user.id})`)
			.setDescription(`Case ID: \`${modCase.id}\``)
			.setThumbnail(modCase.user.displayAvatarURL())
			/* eslint-disable indent */
			.setColor(
				modCase.type === 'ban' ? this.client.settings.colors.red :
				modCase.type === 'unban' ? this.client.settings.colors.red :
				modCase.type === 'kick' ? this.client.settings.colors.red :
				modCase.type === 'mute' ? this.client.settings.colors.red :
				modCase.type === 'unmute' ? this.client.settings.colors.red :
				modCase.type === 'purge' ? this.client.settings.colors.red :
				modCase.type === 'softban' ? this.client.settings.colors.red :
				modCase.type === 'vcban' ? this.client.settings.colors.red :
				modCase.type === 'vcunban' ? this.client.settings.colors.red :
				modCase.type === 'vckick' ? this.client.settings.colors.red :
				modCase.type === 'antiInvite' ? this.client.settings.colors.red :
				modCase.type === 'mentionSpam' ? this.client.settings.colors.red :
				modCase.type === 'blacklistedWord' ? this.client.settings.colors.red :
				modCase.type === 'blacklistedName' ? this.client.settings.colors.red :
				modCase.type === 'warn' ? this.client.settings.colors.red :
				this.client.settings.colors.blue)
			/* eslint-enable indent */
			.setTimestamp(modCase.timestamp)
			.setFooter('Event Logged', this.client.user.displayAvatarURL());

		// Fields for all
		caseEmbed.addField('Moderator:', modCase.moderator ? modCase.moderator : 'Unspecified', true);
		caseEmbed.addField('Reason:', modCase.reason ? modCase.reason : 'Unspecified', true);

		// Type-specific fields
		if (modCase.duration) caseEmbed.addField('Duration:', modCase.duration);
		if (modCase.deletedMessageCount) caseEmbed.addField('Deleted Messages:', modCase.deletedMessageCount);
		if (modCase.messageContent) caseEmbed.addField('Message Content:', modCase.deletedMessageContent);
		if (modCase.badNickname) caseEmbed.addField('Blacklisted Nickname:', modCase.badNickname);

		// Optional (for all) fields
		if (modCase.link) caseEmbed.addField('', `[Click Here to View Action](${modCase.link})`);
		if (modCase.silent) caseEmbed.addField('', 'Command Executed Silently');

		return caseEmbed;
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
