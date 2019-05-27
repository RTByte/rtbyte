// Copyright (c) 2017-2019 dirigeants. All rights reserved. MIT license. Modified by Rasmus Gerdin for use in RTByte.
const { Command, RichDisplay, util: { isFunction } } = require('klasa');
const { MessageEmbed, Permissions } = require('discord.js');

const PERMISSIONS_RICHDISPLAY = new Permissions([Permissions.FLAGS.MANAGE_MESSAGES, Permissions.FLAGS.ADD_REACTIONS]);
const time = 1000 * 60 * 3;

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['commands', 'cmd', 'cmds'],
			guarded: true,
			description: (language) => language.get('COMMAND_HELP_DESCRIPTION'),
			usage: '(command:command)'
		});

		this.createCustomResolver('command', (arg, possible, msg) => {
			if (!arg || arg === '') return undefined;
			return this.client.arguments.get('command').run(arg, possible, msg);
		});

		// Cache the handlers
		this.handlers = new Map();
	}

	async run(msg, [command]) {
		if (command) {
			const { prefix } = msg.guildSettings;
			const embed = new MessageEmbed()
				.setAuthor(`${prefix}${command.name}`, this.client.user.displayAvatarURL())
				.setDescription(isFunction(command.description) ? command.description(msg.language) : command.description)
				.addField(msg.language.get('COMMAND_HELP_USAGE'), command.usage.fullUsage(msg))
				.addField(msg.language.get('COMMAND_HELP_EXTENDED'), isFunction(command.extendedHelp) ? command.extendedHelp(msg.language) : command.extendedHelp)
				.setColor(this.client.settings.colors.white)
				.setThumbnail(this.client.user.displayAvatarURL(), 50, 50)
				.setTimestamp()
				.setFooter(msg.language.get('COMMAND_REQUESTED_BY', msg), msg.author.displayAvatarURL());

			return msg.send('', { disableEveryone: true, embed: embed });
		}

		if (!('all' in msg.flags) && msg.guild && msg.channel.permissionsFor(this.client.user).has(PERMISSIONS_RICHDISPLAY)) {
			// Finish the previous handler
			const previousHandler = this.handlers.get(msg.author.id);
			if (previousHandler) previousHandler.stop();

			const loadingEmbed = new MessageEmbed()
				.setAuthor(msg.language.get('COMMAND_HELP_EMBEDTITLE'), this.client.user.displayAvatarURL())
				.setDescription(msg.language.get('COMMAND_HELP_LOADING'))
				.setColor(this.client.settings.colors.white)
				.setThumbnail(this.client.user.displayAvatarURL(), 50, 50)
				.setTimestamp();

			const handler = await (await this.buildDisplay(msg)).run(await msg.send('', { disableEveryone: true, embed: loadingEmbed }), {
				filter: (reaction, user) => user.id === msg.author.id,
				time
			});
			handler.on('end', () => this.handlers.delete(msg.author.id));
			this.handlers.set(msg.author.id, handler);
			return handler;
		}

		return msg.author.send(await this.buildHelp(msg), { split: { char: '\n' } })
			.then(() => { if (msg.channel.type !== 'dm') msg.sendMessage(msg.language.get('COMMAND_HELP_DM')); })
			.catch(() => { if (msg.channel.type !== 'dm') msg.sendMessage(msg.language.get('COMMAND_HELP_NODM')); });
	}

	async buildHelp(msg) {
		const commands = await this._fetchCommands(msg);
		const { prefix } = msg.guildSettings;

		const helpMessage = [];
		for (const [category, list] of commands) {
			helpMessage.push(`**${category} commands**:\n`, list.map(this.formatCommand.bind(this, msg, prefix, false)).join('\n'), '');
		}

		return helpMessage.join('\n');
	}

	async buildDisplay(msg) {
		const arrowToLeftEmoji = this.client.emojis.get(this.client.settings.emoji.arrowToLeft);
		const arrowLeftEmoji = this.client.emojis.get(this.client.settings.emoji.arrowLeft);
		const arrowRightEmoji = this.client.emojis.get(this.client.settings.emoji.arrowRight);
		const arrowToRightEmoji = this.client.emojis.get(this.client.settings.emoji.arrowToRight);
		const rejectEmoji = this.client.emojis.get(this.client.settings.emoji.reject);
		const listEmoji = this.client.emojis.get(this.client.settings.emoji.list);
		const commands = await this._fetchCommands(msg);
		const { prefix } = msg.guildSettings;
		const display = new RichDisplay()
			.setEmojis({
				first: arrowToLeftEmoji.id,
				back: arrowLeftEmoji.id,
				forward: arrowRightEmoji.id,
				last: arrowToRightEmoji.id,
				stop: rejectEmoji.id,
				jump: listEmoji.id
			})
			.setFooterPrefix(`${msg.language.get('COMMAND_REQUESTED_BY', msg)} (`)
			.setFooterSuffix(')');
		for (const [category, list] of commands) {
			display.addPage(new MessageEmbed()
				.setAuthor(msg.language.get('COMMAND_HELP_EMBEDTITLE'), this.client.user.displayAvatarURL())
				.setTitle(`${category} commands`)
				.setColor(this.client.settings.colors.white)
				.setThumbnail(this.client.user.displayAvatarURL(), 50, 50)
				.setTimestamp()
				.setDescription(list.map(this.formatCommand.bind(this, msg, prefix, true)).join('\n'))
			);
		}

		return display;
	}

	formatCommand(msg, prefix, richDisplay, command) {
		const description = isFunction(command.description) ? command.description(msg.language) : command.description;
		return richDisplay ? `• **${command.name}:** ${description}` : `• **${prefix}${command.name}:** ${description}`;
	}

	async _fetchCommands(msg) {
		const run = this.client.inhibitors.run.bind(this.client.inhibitors, msg);
		const commands = new Map();
		await Promise.all(this.client.commands.map((command) => run(command, true)
			.then(() => {
				const category = commands.get(command.category);
				if (category) category.push(command);
				else commands.set(command.category, [command]);
			}).catch(() => {
				// noop
			})
		));

		return commands;
	}

};
