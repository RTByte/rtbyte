const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['p'],
			permissionLevel: 5,
			requiredPermissions: ['MANAGE_MESSAGES', 'ADD_REACTIONS', 'USE_EXTERNAL_EMOJIS', 'SEND_MESSAGES', 'EMBED_LINKS'],
			runIn: ['text'],
			description: (msg) => msg.language.get('COMMAND_PURGE_DESCRIPTION'),
			usage: '[member:member] <amount:int{2,100}> [all] [-s]',
			usageDelim: ' '
		});
	}

	async run(msg, [member = null, amount, all = null, silent = null]) {
		if (member && !msg.member.canMod(member)) return msg.reject(msg.language.get('COMMAND_PURGE_NO_PERMS', this.client.emojis.get(this.client.configs.emoji.reject), member));

		let messages = await msg.channel.messages.fetch({ limit: amount });

		if (member) {
			messages = await messages.filter(mes => mes.author.id === member.id);
		}

		if (!all) {
			const modableMessages = await this.modableFinder(msg.member, messages);
			messages = await messages.filter(mes => modableMessages.includes(mes.id));
		}

		try {
			await msg.channel.bulkDelete(messages);
		} catch (err) {
			await messages.deleteAll();
		}

		if (msg.guild.configs.logs.messagePurge && messages.size) await this.purgeLog(msg.member, messages.size, member);

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

	async purgeLog(executor, numPurged, member = null) {
		const embed = new MessageEmbed()
			.setAuthor(`${executor.user.tag} - (${executor.id})`, executor.user.avatarURL())
			.setColor(this.client.configs.colors.red)
			.setTimestamp()
			.addField(executor.guild.language.get('GUILD_LOG_MESSAGEPURGE_AMOUNT'), numPurged)
			.setFooter(executor.guild.language.get('GUILD_LOG_MESSAGEPURGE'));

		if (member) embed.addField(executor.guild.language.get('GUILD_LOG_MESSAGEPURGE_TARGET'), member);

		const logChannel = await this.client.channels.get(executor.guild.configs.channels.serverLog);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

	async init() {
		await this.ensureGuildVars();
		return;
	}

	async ensureGuildVars() {
		if (!this.client.gateways.guilds.schema.has('logs')) await this.client.gateways.guilds.schema.add('logs');
		if (!this.client.gateways.guilds.schema.logs.has('messagePurge')) await this.client.gateways.guilds.schema.logs.add('messagePurge', { type: 'Boolean', array: false, default: true });
		return;
	}

};
