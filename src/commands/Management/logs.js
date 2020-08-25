/* eslint-disable complexity */
const { Command, RichDisplay } = require('klasa');
const { MessageEmbed } = require('discord.js');

const enableDisableArr = ['cmdrun', 'msgdelete', 'msgedit', 'serverupdate',
	'invitecreate', 'invitedelete', 'channelcreate', 'channeldelete',
	'channelupdate', 'rolecreate', 'roledelete', 'roleupdate', 'emojicreate',
	'emojidelete', 'emojiupdate', 'webhookcreate', 'webhookdelete',
	'webhookupdate', 'customcmdcreate', 'customcmddelete', 'customcmdupdate',
	'memberjoin', 'botadd', 'memberleave', 'memberupdate', 'nitroadd',
	'nitroremove', 'nitrolvlupdate'];
const logsArr = ['commandRun', 'messageDelete',
	'messageUpdate', 'guildUpdate', 'inviteCreate', 'inviteDelete', 'channelCreate',
	'channelDelete', 'channelUpdate', 'roleCreate', 'roleDelete', 'roleUpdate',
	'emojiCreate', 'emojiDelete', 'emojiUpdate', 'webhookCreate', 'webhookDelete',
	'webhookUpdate', 'customCmdCreate', 'customCmdDelete', 'customCmdUpdate',
	'guildMemberAdd', 'guildBotAdd', 'guildMemberRemove', 'guildMemberUpdate',
	'guildBoostAdd', 'guildBoostRemove', 'guildBoostTierUpdate'];
const timeout = 1000 * 60 * 3;

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			permissionLevel: 7,
			description: language => language.get('COMMAND_LOGS_DESCRIPTION'),
			runIn: ['text'],
			subcommands: true,
			usage: '<enable|disable|set|reset|show:default> [channel|all|event:str] [value:channel]',
			usageDelim: ' '
		});

		// Cache the handlers
		this.handlers = new Map();
	}

	async show(msg) {
		const previousHandler = this.handlers.get(msg.author.id);
		if (previousHandler) previousHandler.stop();

		const loadingEmbed = new MessageEmbed()
			.setTitle(msg.language.get('COMMAND_LOGS_SHOW_LOADING'))
			.setColor(this.client.settings.get('colors.white'))
			.setThumbnail(msg.guild.iconURL(), 50, 50)
			.setTimestamp();

		const handler = await (await this.buildDisplay(msg)).run(await msg.send('', { disableEveryone: true, embed: loadingEmbed }), {
			filter: (reaction, user) => user.id === msg.author.id,
			timeout
		});

		handler.on('end', () => this.handlers.delete(msg.author.id));
		this.handlers.set(msg.author.id, handler);
		return handler;
	}

	async enable(msg, [setting]) {
		if (!setting) return msg.reject(msg.language.get('COMMAND_LOGS_NOSETTING'));

		setting = setting.toLowerCase();
		if (!enableDisableArr.includes(setting) && setting !== 'all') return msg.reject(msg.language.get('COMMAND_LOGS_ENABLE_ONLY_EVENT'));

		const channelCreate = msg.guild.settings.get('logs.events.channelCreate');
		const channelDelete = msg.guild.settings.get('logs.events.channelDelete');
		const channelUpdate = msg.guild.settings.get('logs.events.channelUpdate');
		const commandRun = msg.guild.settings.get('logs.events.commandRun');
		const customCmdCreate = msg.guild.settings.get('logs.events.customCmdCreate');
		const customCmdDelete = msg.guild.settings.get('logs.events.customCmdDelete');
		const customCmdUpdate = msg.guild.settings.get('logs.events.customCmdUpdate');
		const emojiCreate = msg.guild.settings.get('logs.events.emojiCreate');
		const emojiDelete = msg.guild.settings.get('logs.events.emojiDelete');
		const emojiUpdate = msg.guild.settings.get('logs.events.emojiUpdate');
		const guildUpdate = msg.guild.settings.get('logs.events.guildUpdate');
		const guildMemberAdd = msg.guild.settings.get('logs.events.guildMemberAdd');
		const guildBotAdd = msg.guild.settings.get('logs.events.guildBotAdd');
		const guildMemberRemove = msg.guild.settings.get('logs.events.guildMemberRemove');
		const guildMemberUpdate = msg.guild.settings.get('logs.events.guildMemberUpdate');
		const guildBoostAdd = msg.guild.settings.get('logs.events.guildBoostAdd');
		const guildBoostRemove = msg.guild.settings.get('logs.events.guildBoostRemove');
		const guildBoostTierUpdate = msg.guild.settings.get('logs.events.guildBoostTierUpdate');
		const inviteCreate = msg.guild.settings.get('logs.events.inviteCreate');
		const inviteDelete = msg.guild.settings.get('logs.events.inviteDelete');
		const messageDelete = msg.guild.settings.get('logs.events.messageDelete');
		const messageUpdate = msg.guild.settings.get('logs.events.messageUpdate');
		const roleCreate = msg.guild.settings.get('logs.events.roleCreate');
		const roleDelete = msg.guild.settings.get('logs.events.roleDelete');
		const roleUpdate = msg.guild.settings.get('logs.events.roleUpdate');
		const webhookCreate = msg.guild.settings.get('logs.events.webhookCreate');
		const webhookDelete = msg.guild.settings.get('logs.events.webhookDelete');
		const webhookUpdate = msg.guild.settings.get('logs.events.webhookUpdate');

		if (setting === 'cmdrun' && commandRun) return msg.reject(msg.language.get('COMMAND_LOGS_ENABLE_ALREADYENABLED', setting));
		if (setting === 'msgdelete' && messageDelete) return msg.reject(msg.language.get('COMMAND_LOGS_ENABLE_ALREADYENABLED', setting));
		if (setting === 'msgedit' && messageUpdate) return msg.reject(msg.language.get('COMMAND_LOGS_ENABLE_ALREADYENABLED', setting));
		if (setting === 'serverupdate' && guildUpdate) return msg.reject(msg.language.get('COMMAND_LOGS_ENABLE_ALREADYENABLED', setting));
		if (setting === 'invitecreate' && inviteCreate) return msg.reject(msg.language.get('COMMAND_LOGS_ENABLE_ALREADYENABLED', setting));
		if (setting === 'invitedelete' && inviteDelete) return msg.reject(msg.language.get('COMMAND_LOGS_ENABLE_ALREADYENABLED', setting));
		if (setting === 'channelcreate' && channelCreate) return msg.reject(msg.language.get('COMMAND_LOGS_ENABLE_ALREADYENABLED', setting));
		if (setting === 'channeldelete' && channelDelete) return msg.reject(msg.language.get('COMMAND_LOGS_ENABLE_ALREADYENABLED', setting));
		if (setting === 'channelupdate' && channelUpdate) return msg.reject(msg.language.get('COMMAND_LOGS_ENABLE_ALREADYENABLED', setting));
		if (setting === 'rolecreate' && roleCreate) return msg.reject(msg.language.get('COMMAND_LOGS_ENABLE_ALREADYENABLED', setting));
		if (setting === 'roledelete' && roleDelete) return msg.reject(msg.language.get('COMMAND_LOGS_ENABLE_ALREADYENABLED', setting));
		if (setting === 'roleupdate' && roleUpdate) return msg.reject(msg.language.get('COMMAND_LOGS_ENABLE_ALREADYENABLED', setting));
		if (setting === 'emojicreate' && emojiCreate) return msg.reject(msg.language.get('COMMAND_LOGS_ENABLE_ALREADYENABLED', setting));
		if (setting === 'emojidelete' && emojiDelete) return msg.reject(msg.language.get('COMMAND_LOGS_ENABLE_ALREADYENABLED', setting));
		if (setting === 'emojiupdate' && emojiUpdate) return msg.reject(msg.language.get('COMMAND_LOGS_ENABLE_ALREADYENABLED', setting));
		if (setting === 'webhookcreate' && webhookCreate) return msg.reject(msg.language.get('COMMAND_LOGS_ENABLE_ALREADYENABLED', setting));
		if (setting === 'webhookdelete' && webhookDelete) return msg.reject(msg.language.get('COMMAND_LOGS_ENABLE_ALREADYENABLED', setting));
		if (setting === 'webhookupdate' && webhookUpdate) return msg.reject(msg.language.get('COMMAND_LOGS_ENABLE_ALREADYENABLED', setting));
		if (setting === 'customcmdcreate' && customCmdCreate) return msg.reject(msg.language.get('COMMAND_LOGS_ENABLE_ALREADYENABLED', setting));
		if (setting === 'customcmddelete' && customCmdDelete) return msg.reject(msg.language.get('COMMAND_LOGS_ENABLE_ALREADYENABLED', setting));
		if (setting === 'customcmdupdate' && customCmdUpdate) return msg.reject(msg.language.get('COMMAND_LOGS_ENABLE_ALREADYENABLED', setting));
		if (setting === 'memberjoin' && guildMemberAdd) return msg.reject(msg.language.get('COMMAND_LOGS_ENABLE_ALREADYENABLED', setting));
		if (setting === 'botadd' && guildBotAdd) return msg.reject(msg.language.get('COMMAND_LOGS_ENABLE_ALREADYENABLED', setting));
		if (setting === 'memberleave' && guildMemberRemove) return msg.reject(msg.language.get('COMMAND_LOGS_ENABLE_ALREADYENABLED', setting));
		if (setting === 'memberupdate' && guildMemberUpdate) return msg.reject(msg.language.get('COMMAND_LOGS_ENABLE_ALREADYENABLED', setting));
		if (setting === 'nitroadd' && guildBoostAdd) return msg.reject(msg.language.get('COMMAND_LOGS_ENABLE_ALREADYENABLED', setting));
		if (setting === 'nitroremove' && guildBoostRemove) return msg.reject(msg.language.get('COMMAND_LOGS_ENABLE_ALREADYENABLED', setting));
		if (setting === 'nitrolvlupdate' && guildBoostTierUpdate) return msg.reject(msg.language.get('COMMAND_LOGS_ENABLE_ALREADYENABLED', setting));

		if (setting === 'cmdrun') setting = 'commandRun';
		if (setting === 'msgdelete') setting = 'messageDelete';
		if (setting === 'msgedit') setting = 'messageUpdate';
		if (setting === 'serverupdate') setting = 'guildUpdate';
		if (setting === 'invitecreate') setting = 'inviteCreate';
		if (setting === 'invitedelete') setting = 'inviteDelete';
		if (setting === 'channelcreate') setting = 'channelCreate';
		if (setting === 'channeldelete') setting = 'channelDelete';
		if (setting === 'channelupdate') setting = 'channelUpdate';
		if (setting === 'rolecreate') setting = 'roleCreate';
		if (setting === 'roledelete') setting = 'roleDelete';
		if (setting === 'roleupdate') setting = 'roleUpdate';
		if (setting === 'emojicreate') setting = 'emojiCreate';
		if (setting === 'emojidelete') setting = 'emojiDelete';
		if (setting === 'emojiupdate') setting = 'emojiUpdate';
		if (setting === 'webhookcreate') setting = 'webhookCreate';
		if (setting === 'webhookdelete') setting = 'webhookDelete';
		if (setting === 'webhookupdate') setting = 'webhookUpdate';
		if (setting === 'customcmdcreate') setting = 'customCmdCreate';
		if (setting === 'customcmddelete') setting = 'customCmdDelete';
		if (setting === 'customcmdupdate') setting = 'customCmdUpdate';
		if (setting === 'memberjoin') setting = 'guildMemberAdd';
		if (setting === 'botadd') setting = 'guildBotAdd';
		if (setting === 'memberleave') setting = 'guildMemberRemove';
		if (setting === 'memberupdate') setting = 'guildMemberUpdate';
		if (setting === 'nitroadd') setting = 'guildBoostAdd';
		if (setting === 'nitroremove') setting = 'guildBoostRemove';
		if (setting === 'nitrolvlupdate') setting = 'guildBoostTierUpdate';

		if (setting === 'all') {
			logsArr.forEach(async (sett) => {
				await msg.guild.settings.sync();
				await msg.guild.settings.update(`logs.events.${sett}`, true);
			});
		} else {
			await msg.guild.settings.update(`logs.events.${setting}`, true);
		}

		return msg.affirm();
	}

	async disable(msg, [setting]) {
		if (!setting) return msg.reject(msg.language.get('COMMAND_LOGS_NOSETTING'));

		setting = setting.toLowerCase();
		if (!enableDisableArr.includes(setting) && setting !== 'all') return msg.reject(msg.language.get('COMMAND_LOGS_DISABLE_ONLY_EVENT'));

		const channelCreate = msg.guild.settings.get('logs.events.channelCreate');
		const channelDelete = msg.guild.settings.get('logs.events.channelDelete');
		const channelUpdate = msg.guild.settings.get('logs.events.channelUpdate');
		const commandRun = msg.guild.settings.get('logs.events.commandRun');
		const customCmdCreate = msg.guild.settings.get('logs.events.customCmdCreate');
		const customCmdDelete = msg.guild.settings.get('logs.events.customCmdDelete');
		const customCmdUpdate = msg.guild.settings.get('logs.events.customCmdUpdate');
		const emojiCreate = msg.guild.settings.get('logs.events.emojiCreate');
		const emojiDelete = msg.guild.settings.get('logs.events.emojiDelete');
		const emojiUpdate = msg.guild.settings.get('logs.events.emojiUpdate');
		const guildUpdate = msg.guild.settings.get('logs.events.guildUpdate');
		const guildMemberAdd = msg.guild.settings.get('logs.events.guildMemberAdd');
		const guildBotAdd = msg.guild.settings.get('logs.events.guildBotAdd');
		const guildMemberRemove = msg.guild.settings.get('logs.events.guildMemberRemove');
		const guildMemberUpdate = msg.guild.settings.get('logs.events.guildMemberUpdate');
		const guildBoostAdd = msg.guild.settings.get('logs.events.guildBoostAdd');
		const guildBoostRemove = msg.guild.settings.get('logs.events.guildBoostRemove');
		const guildBoostTierUpdate = msg.guild.settings.get('logs.events.guildBoostTierUpdate');
		const inviteCreate = msg.guild.settings.get('logs.events.inviteCreate');
		const inviteDelete = msg.guild.settings.get('logs.events.inviteDelete');
		const messageDelete = msg.guild.settings.get('logs.events.messageDelete');
		const messageUpdate = msg.guild.settings.get('logs.events.messageUpdate');
		const roleCreate = msg.guild.settings.get('logs.events.roleCreate');
		const roleDelete = msg.guild.settings.get('logs.events.roleDelete');
		const roleUpdate = msg.guild.settings.get('logs.events.roleUpdate');
		const webhookCreate = msg.guild.settings.get('logs.events.webhookCreate');
		const webhookDelete = msg.guild.settings.get('logs.events.webhookDelete');
		const webhookUpdate = msg.guild.settings.get('logs.events.webhookUpdate');

		if (setting === 'cmdrun' && !commandRun) return msg.reject(msg.language.get('COMMAND_LOGS_DISABLE_ALREADYDISABLED', setting));
		if (setting === 'msgdelete' && !messageDelete) return msg.reject(msg.language.get('COMMAND_LOGS_DISABLE_ALREADYDISABLED', setting));
		if (setting === 'msgedit' && !messageUpdate) return msg.reject(msg.language.get('COMMAND_LOGS_DISABLE_ALREADYDISABLED', setting));
		if (setting === 'serverupdate' && !guildUpdate) return msg.reject(msg.language.get('COMMAND_LOGS_DISABLE_ALREADYDISABLED', setting));
		if (setting === 'invitecreate' && !inviteCreate) return msg.reject(msg.language.get('COMMAND_LOGS_DISABLE_ALREADYDISABLED', setting));
		if (setting === 'invitedelete' && !inviteDelete) return msg.reject(msg.language.get('COMMAND_LOGS_DISABLE_ALREADYDISABLED', setting));
		if (setting === 'channelcreate' && !channelCreate) return msg.reject(msg.language.get('COMMAND_LOGS_DISABLE_ALREADYDISABLED', setting));
		if (setting === 'channeldelete' && !channelDelete) return msg.reject(msg.language.get('COMMAND_LOGS_DISABLE_ALREADYDISABLED', setting));
		if (setting === 'channelupdate' && !channelUpdate) return msg.reject(msg.language.get('COMMAND_LOGS_DISABLE_ALREADYDISABLED', setting));
		if (setting === 'rolecreate' && !roleCreate) return msg.reject(msg.language.get('COMMAND_LOGS_DISABLE_ALREADYDISABLED', setting));
		if (setting === 'roledelete' && !roleDelete) return msg.reject(msg.language.get('COMMAND_LOGS_DISABLE_ALREADYDISABLED', setting));
		if (setting === 'roleupdate' && !roleUpdate) return msg.reject(msg.language.get('COMMAND_LOGS_DISABLE_ALREADYDISABLED', setting));
		if (setting === 'emojicreate' && !emojiCreate) return msg.reject(msg.language.get('COMMAND_LOGS_DISABLE_ALREADYDISABLED', setting));
		if (setting === 'emojidelete' && !emojiDelete) return msg.reject(msg.language.get('COMMAND_LOGS_DISABLE_ALREADYDISABLED', setting));
		if (setting === 'emojiupdate' && !emojiUpdate) return msg.reject(msg.language.get('COMMAND_LOGS_DISABLE_ALREADYDISABLED', setting));
		if (setting === 'webhookcreate' && !webhookCreate) return msg.reject(msg.language.get('COMMAND_LOGS_DISABLE_ALREADYDISABLED', setting));
		if (setting === 'webhookdelete' && !webhookDelete) return msg.reject(msg.language.get('COMMAND_LOGS_DISABLE_ALREADYDISABLED', setting));
		if (setting === 'webhookupdate' && !webhookUpdate) return msg.reject(msg.language.get('COMMAND_LOGS_DISABLE_ALREADYDISABLED', setting));
		if (setting === 'customcmdcreate' && !customCmdCreate) return msg.reject(msg.language.get('COMMAND_LOGS_DISABLE_ALREADYDISABLED', setting));
		if (setting === 'customcmddelete' && !customCmdDelete) return msg.reject(msg.language.get('COMMAND_LOGS_DISABLE_ALREADYDISABLED', setting));
		if (setting === 'customcmdupdate' && !customCmdUpdate) return msg.reject(msg.language.get('COMMAND_LOGS_DISABLE_ALREADYDISABLED', setting));
		if (setting === 'memberjoin' && !guildMemberAdd) return msg.reject(msg.language.get('COMMAND_LOGS_DISABLE_ALREADYDISABLED', setting));
		if (setting === 'botadd' && !guildBotAdd) return msg.reject(msg.language.get('COMMAND_LOGS_DISABLE_ALREADYDISABLED', setting));
		if (setting === 'memberleave' && !guildMemberRemove) return msg.reject(msg.language.get('COMMAND_LOGS_DISABLE_ALREADYDISABLED', setting));
		if (setting === 'memberupdate' && !guildMemberUpdate) return msg.reject(msg.language.get('COMMAND_LOGS_DISABLE_ALREADYDISABLED', setting));
		if (setting === 'nitroadd' && !guildBoostAdd) return msg.reject(msg.language.get('COMMAND_LOGS_DISABLE_ALREADYDISABLED', setting));
		if (setting === 'nitroremove' && !guildBoostRemove) return msg.reject(msg.language.get('COMMAND_LOGS_DISABLE_ALREADYDISABLED', setting));
		if (setting === 'nitrolvlupdate' && !guildBoostTierUpdate) return msg.reject(msg.language.get('COMMAND_LOGS_DISABLE_ALREADYDISABLED', setting));

		if (setting === 'cmdrun') setting = 'commandRun';
		if (setting === 'msgdelete') setting = 'messageDelete';
		if (setting === 'msgedit') setting = 'messageUpdate';
		if (setting === 'serverupdate') setting = 'guildUpdate';
		if (setting === 'invitecreate') setting = 'inviteCreate';
		if (setting === 'invitedelete') setting = 'inviteDelete';
		if (setting === 'channelcreate') setting = 'channelCreate';
		if (setting === 'channeldelete') setting = 'channelDelete';
		if (setting === 'channelupdate') setting = 'channelUpdate';
		if (setting === 'rolecreate') setting = 'roleCreate';
		if (setting === 'roledelete') setting = 'roleDelete';
		if (setting === 'roleupdate') setting = 'roleUpdate';
		if (setting === 'emojicreate') setting = 'emojiCreate';
		if (setting === 'emojidelete') setting = 'emojiDelete';
		if (setting === 'emojiupdate') setting = 'emojiUpdate';
		if (setting === 'webhookcreate') setting = 'webhookCreate';
		if (setting === 'webhookdelete') setting = 'webhookDelete';
		if (setting === 'webhookupdate') setting = 'webhookUpdate';
		if (setting === 'customcmdcreate') setting = 'customCmdCreate';
		if (setting === 'customcmddelete') setting = 'customCmdDelete';
		if (setting === 'customcmdupdate') setting = 'customCmdUpdate';
		if (setting === 'memberjoin') setting = 'guildMemberAdd';
		if (setting === 'botadd') setting = 'guildBotAdd';
		if (setting === 'memberleave') setting = 'guildMemberRemove';
		if (setting === 'memberupdate') setting = 'guildMemberUpdate';
		if (setting === 'nitroadd') setting = 'guildBoostAdd';
		if (setting === 'nitroremove') setting = 'guildBoostRemove';
		if (setting === 'nitrolvlupdate') setting = 'guildBoostTierUpdate';

		if (setting === 'all') {
			logsArr.forEach(async (sett) => {
				await msg.guild.settings.sync();
				await msg.guild.settings.update(`logs.events.${sett}`, false);
			});
		} else {
			await msg.guild.settings.update(`logs.events.${setting}`, false);
		}

		return msg.affirm();
	}

	async set(msg, [setting, value]) {
		if (!setting) return msg.reject(msg.language.get('COMMAND_LOGS_NOSETTING'));
		setting = setting.toLowerCase();

		if (setting !== 'channel') return msg.reject(msg.language.get('COMMAND_LOGS_NOSETTING'));
		if (!value && (setting === 'channel')) return msg.reject(msg.language.get('COMMAND_LOGS_NOVALUE'));

		const logChannel = msg.guild.settings.get('channels.log');
		if (setting === 'channel') setting = 'log';
		if (value.id === logChannel) return msg.reject(msg.language.get('COMMAND_LOGS_SET_CHANNEL_SAMECHANNEL', value));

		await msg.guild.settings.update(`channels.${setting}`, value);

		return msg.affirm();
	}

	async reset(msg, [setting]) {
		if (!setting) return msg.reject(msg.language.get('COMMAND_LOGS_NOSETTING'));

		setting = setting.toLowerCase();

		const logChannel = msg.guild.settings.get('channels.log');
		if (setting === 'channel') setting = 'log';
		if (setting === 'log' && !logChannel) return msg.reject(msg.language.get('COMMAND_LOGS_RESET_CHANNEL_NOTSET'));

		await msg.guild.settings.reset(`channels.${setting}`);

		return msg.affirm();
	}

	async buildDisplay(msg) {
		const affirmEmoji = this.client.emojis.cache.get(this.client.settings.get('emoji.affirm'));
		const rejectEmoji = this.client.emojis.cache.get(this.client.settings.get('emoji.reject'));
		const arrowToLeftEmoji = this.client.emojis.cache.get(this.client.settings.get('emoji.arrowToLeft'));
		const arrowLeftEmoji = this.client.emojis.cache.get(this.client.settings.get('emoji.arrowLeft'));
		const arrowRightEmoji = this.client.emojis.cache.get(this.client.settings.get('emoji.arrowRight'));
		const arrowToRightEmoji = this.client.emojis.cache.get(this.client.settings.get('emoji.arrowToRight'));
		const listEmoji = this.client.emojis.cache.get(this.client.settings.get('emoji.list'));
		const status = {
			true: affirmEmoji,
			false: rejectEmoji
		};

		const logChannel = msg.guild.channels.cache.get(msg.guild.settings.get('channels.log')) || msg.language.get('NOT_SET');
		const channelCreate = status[msg.guild.settings.get('logs.events.channelCreate')];
		const channelDelete = status[msg.guild.settings.get('logs.events.channelDelete')];
		const channelUpdate = status[msg.guild.settings.get('logs.events.channelUpdate')];
		const commandRun = status[msg.guild.settings.get('logs.events.commandRun')];
		const customCmdCreate = status[msg.guild.settings.get('logs.events.customCmdCreate')];
		const customCmdDelete = status[msg.guild.settings.get('logs.events.customCmdDelete')];
		const customCmdUpdate = status[msg.guild.settings.get('logs.events.customCmdUpdate')];
		const emojiCreate = status[msg.guild.settings.get('logs.events.emojiCreate')];
		const emojiDelete = status[msg.guild.settings.get('logs.events.emojiDelete')];
		const emojiUpdate = status[msg.guild.settings.get('logs.events.emojiUpdate')];
		const guildUpdate = status[msg.guild.settings.get('logs.events.guildUpdate')];
		const guildMemberAdd = status[msg.guild.settings.get('logs.events.guildMemberAdd')];
		const guildBotAdd = status[msg.guild.settings.get('logs.events.guildBotAdd')];
		const guildMemberRemove = status[msg.guild.settings.get('logs.events.guildMemberRemove')];
		const guildMemberUpdate = status[msg.guild.settings.get('logs.events.guildMemberUpdate')];
		const guildBoostAdd = status[msg.guild.settings.get('logs.events.guildBoostAdd')];
		const guildBoostRemove = status[msg.guild.settings.get('logs.events.guildBoostRemove')];
		const guildBoostTierUpdate = status[msg.guild.settings.get('logs.events.guildBoostTierUpdate')];
		const inviteCreate = status[msg.guild.settings.get('logs.events.inviteCreate')];
		const inviteDelete = status[msg.guild.settings.get('logs.events.inviteDelete')];
		const messageDelete = status[msg.guild.settings.get('logs.events.messageDelete')];
		const messageUpdate = status[msg.guild.settings.get('logs.events.messageUpdate')];
		const roleCreate = status[msg.guild.settings.get('logs.events.roleCreate')];
		const roleDelete = status[msg.guild.settings.get('logs.events.roleDelete')];
		const roleUpdate = status[msg.guild.settings.get('logs.events.roleUpdate')];
		const webhookCreate = status[msg.guild.settings.get('logs.events.webhookCreate')];
		const webhookDelete = status[msg.guild.settings.get('logs.events.webhookDelete')];
		const webhookUpdate = status[msg.guild.settings.get('logs.events.webhookUpdate')];

		const page1 = new MessageEmbed()
			.setAuthor(msg.language.get('COMMAND_LOGS_SHOW_TITLE'), this.client.user.displayAvatarURL())
			.setDescription(msg.language.get('COMMAND_MANAGEMENT_SHOW_DESCRIPTION'))
			.setColor(this.client.settings.get('colors.white'))
			.addField(msg.language.get('CHANNEL'), logChannel)
			.addField(msg.language.get('COMMAND_LOGS_SHOW_COMMANDRUN'), commandRun, true)
			.addField(msg.language.get('COMMAND_LOGS_SHOW_MESSAGEDELETE'), messageDelete, true)
			.addField(msg.language.get('COMMAND_LOGS_SHOW_MESSAGEUPDATE'), messageUpdate, true)
			.addField(msg.language.get('COMMAND_LOGS_SHOW_GUILDUPDATE'), guildUpdate, true)
			.addField(msg.language.get('COMMAND_LOGS_SHOW_INVITECREATE'), inviteCreate, true)
			.addField(msg.language.get('COMMAND_LOGS_SHOW_INVITEDELETE'), inviteDelete, true)
			.addField(msg.language.get('COMMAND_LOGS_SHOW_CHANNELCREATE'), channelCreate, true)
			.addField(msg.language.get('COMMAND_LOGS_SHOW_CHANNELDELETE'), channelDelete, true)
			.addField(msg.language.get('COMMAND_LOGS_SHOW_CHANNELUPDATE'), channelUpdate, true)
			.addField(msg.language.get('COMMAND_LOGS_SHOW_ROLECREATE'), roleCreate, true)
			.addField(msg.language.get('COMMAND_LOGS_SHOW_ROLEDELETE'), roleDelete, true)
			.addField(msg.language.get('COMMAND_LOGS_SHOW_ROLEUPDATE'), roleUpdate, true)
			.addField(msg.language.get('COMMAND_LOGS_SHOW_EMOJICREATE'), emojiCreate, true)
			.addField(msg.language.get('COMMAND_LOGS_SHOW_EMOJIDELETE'), emojiDelete, true)
			.addField(msg.language.get('COMMAND_LOGS_SHOW_EMOJIUPDATE'), emojiUpdate, true)
			.setThumbnail(msg.guild.iconURL(), 50, 50)
			.setTimestamp()
			.setFooter(msg.language.get('COMMAND_REQUESTED_BY', msg), msg.author.displayAvatarURL());

		const page2 = new MessageEmbed()
			.setAuthor(msg.language.get('COMMAND_LOGS_SHOW_TITLE'), this.client.user.displayAvatarURL())
			.setDescription(msg.language.get('COMMAND_MANAGEMENT_SHOW_DESCRIPTION'))
			.setColor(this.client.settings.get('colors.white'))
			.addField(msg.language.get('COMMAND_LOGS_SHOW_WEBHOOKCREATE'), webhookCreate, true)
			.addField(msg.language.get('COMMAND_LOGS_SHOW_WEBHOOKDELETE'), webhookDelete, true)
			.addField(msg.language.get('COMMAND_LOGS_SHOW_WEBHOOKUPDATE'), webhookUpdate, true)
			.addField(msg.language.get('COMMAND_LOGS_SHOW_CUSTOMCMDCREATE'), customCmdCreate, true)
			.addField(msg.language.get('COMMAND_LOGS_SHOW_CUSTOMCMDDELETE'), customCmdDelete, true)
			.addField(msg.language.get('COMMAND_LOGS_SHOW_CUSTOMCMDUPDATE'), customCmdUpdate, true)
			.addField(msg.language.get('COMMAND_LOGS_SHOW_GUILDMEMBERADD'), guildMemberAdd, true)
			.addField(msg.language.get('COMMAND_LOGS_SHOW_GUILDBOTADD'), guildBotAdd, true)
			.addField(msg.language.get('COMMAND_LOGS_SHOW_GUILDMEMBERREMOVE'), guildMemberRemove, true)
			.addField(msg.language.get('COMMAND_LOGS_SHOW_GUILDMEMBERUPDATE'), guildMemberUpdate, true)
			.addField(msg.language.get('COMMAND_LOGS_SHOW_GUILDBOOSTADD'), guildBoostAdd, true)
			.addField(msg.language.get('COMMAND_LOGS_SHOW_GUILDBOOSTREMOVE'), guildBoostRemove, true)
			.addField(msg.language.get('COMMAND_LOGS_SHOW_GUILDBOOSTTIERUPDATE'), guildBoostTierUpdate, true)
			.setThumbnail(msg.guild.iconURL(), 50, 50)
			.setTimestamp()
			.setFooter(msg.language.get('COMMAND_REQUESTED_BY', msg), msg.author.displayAvatarURL());

		const display = new RichDisplay()
			.setEmojis({
				first: arrowToLeftEmoji.id,
				back: arrowLeftEmoji.id,
				forward: arrowRightEmoji.id,
				last: arrowToRightEmoji.id,
				stop: rejectEmoji.id,
				jump: listEmoji.id
			})
			.addPage(page1)
			.addPage(page2)
			.setFooterPrefix(`${msg.language.get('COMMAND_REQUESTED_BY', msg)} (`)
			.setFooterSuffix(')');

		return display;
	}

};
