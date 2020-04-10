const { Command } = require('klasa');
const { ModCase } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['p'],
			permissionLevel: 6,
			requiredPermissions: ['MANAGE_MESSAGES', 'ADD_REACTIONS', 'USE_EXTERNAL_EMOJIS', 'SEND_MESSAGES', 'EMBED_LINKS'],
			runIn: ['text'],
			description: language => language.get('COMMAND_PURGE_DESCRIPTION'),
			usage: '[member:membername] <amount:int{2,100}> [-all] [-s]',
			usageDelim: ' '
		});
		this.customizeResponse('amount', message =>
			message.language.get('COMMAND_PURGE_NOPARAM'));
	}

	async run(msg, [membername = null, amount, all = null, silent = null]) {
		if (membername && !msg.member.canMod(membername)) return msg.reject(msg.language.get('COMMAND_PURGE_NO_PERMS', this.client.emojis.cache.get(this.client.settings.emoji.reject), membername));

		let messages = await msg.channel.messages.fetch({ limit: amount });

		if (membername) {
			messages = await messages.filter(mes => mes.author.id === membername.id);
		}

		if (!all) {
			const modableMessages = await this.modableFinder(msg.member, messages);
			messages = await messages.filter(mes => modableMessages.includes(mes.id));
		}

		const modCase = new ModCase(msg.guild)
			.setUser(membername ? this.client.users.cache.get(membername.id) : this.client.user)
			.setType('purge')
			.setModerator(msg.author)
			.setSilent(silent)
			.setDeletedMessageCount(messages.size);
		await modCase.submit();

		try {
			await msg.channel.bulkDelete(messages);
		} catch (err) {
			await messages.cache.each(mes => mes.delete());
		}

		const embed = await modCase.embed();
		await embed.send();

		if (silent && !(all && (!membername || membername.id === msg.author.id))) await msg.delete({ reason: msg.language.get('COMMAND_MODERATION_SILENT') });

		if (silent) return null;
		if (all && (!membername || membername.id === msg.author.id)) return null;
		return msg.affirm();
	}

	async modableFinder(executor, messages) {
		const messageArray = await Array.from(messages.values());
		const modableMessages = [];

		for (let i = 0; i < messageArray.length; i++) {
			if (await executor.canMod(messageArray[i].author)) modableMessages.push(messageArray[i].id);
		}

		return modableMessages;
	}

};
