const { Command } = require('klasa');
const { ModCase } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['p'],
			permissionLevel: 5,
			requiredPermissions: ['MANAGE_MESSAGES', 'ADD_REACTIONS', 'USE_EXTERNAL_EMOJIS', 'SEND_MESSAGES', 'EMBED_LINKS'],
			runIn: ['text'],
			description: language => language.get('COMMAND_PURGE_DESCRIPTION'),
			usage: '[member:member] <amount:int{2,100}> [all] [-s]',
			usageDelim: ' '
		});
		this.customizeResponse('amount', message =>
			message.language.get('COMMAND_PURGE_NOPARAM'));
	}

	async run(msg, [member = null, amount, all = null, silent = null]) {
		if (member && !msg.member.canMod(member)) return msg.reject(msg.language.get('COMMAND_PURGE_NO_PERMS', this.client.emojis.get(this.client.settings.emoji.reject), member));

		let messages = await msg.channel.messages.fetch({ limit: amount });

		if (member) {
			messages = await messages.filter(mes => mes.author.id === member.id);
		}

		if (!all) {
			const modableMessages = await this.modableFinder(msg.member, messages);
			messages = await messages.filter(mes => modableMessages.includes(mes.id));
		}

		const modCase = new ModCase(msg.guild)
			.setUser(member ? this.client.users.get(member.id) : this.client.user)
			.setType('purge')
			.setModerator(msg.author)
			.setSilent(silent)
			.setDeletedMessageCount(messages.size);
		await modCase.submit();

		try {
			await msg.channel.bulkDelete(messages);
		} catch (err) {
			await messages.each(mes => mes.delete());
		}

		const embed = await modCase.embed();
		await embed.send();

		if (silent && !(all && (!member || member.id === msg.author.id))) await msg.delete({ reason: msg.language.get('COMMAND_MODERATION_SILENT') });

		if (silent) return null;
		if (all && (!member || member.id === msg.author.id)) return null;
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
