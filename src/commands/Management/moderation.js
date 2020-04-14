/* eslint-disable complexity */
const { Command, RichDisplay } = require('klasa');
const { MessageEmbed } = require('discord.js');

const enableDisableArr = ['notify', 'purge', 'warn', 'mute', 'unmute',
	'kick', 'softban', 'ban', 'unban', 'vckick', 'vcban', 'vcunban',
	'antiinvite', 'mentionspam', 'blacklistedword', 'blacklistedname'];

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			permissionLevel: 6,
			description: language => language.get('COMMAND_LOGS_DESCRIPTION'),
			runIn: ['text'],
			subcommands: true,
			usage: '<enable|disable|set|reset|show:default> [value:str]',
			usageDelim: ' '
		});
	}

	async show(msg) {
		const affirmEmoji = this.client.emojis.get(this.client.settings.get('emoji.affirm'));
		const rejectEmoji = this.client.emojis.get(this.client.settings.get('emoji.reject'));
		const status = {
			true: affirmEmoji,
			false: rejectEmoji
		};

		const notifyUser = status[msg.guild.settings.get('moderation.notifyUser')];
		const purge = status[msg.guild.settings.get('logs.moderation.purge')];
		const warn = status[msg.guild.settings.get('logs.moderation.warn')];
		const mute = status[msg.guild.settings.get('logs.moderation.mute')];
		const unmute = status[msg.guild.settings.get('logs.moderation.unmute')];
		const kick = status[msg.guild.settings.get('logs.moderation.kick')];
		const softban = status[msg.guild.settings.get('logs.moderation.softban')];
		const ban = status[msg.guild.settings.get('logs.moderation.ban')];
		const unban = status[msg.guild.settings.get('logs.moderation.unban')];
		const vckick = status[msg.guild.settings.get('logs.moderation.vckick')];
		const vcban = status[msg.guild.settings.get('logs.moderation.vcban')];
		const vcunban = status[msg.guild.settings.get('logs.moderation.vcunban')];
		const antiInvite = status[msg.guild.settings.get('logs.moderation.antiInvite')];
		const mentionSpam = status[msg.guild.settings.get('logs.moderation.mentionSpam')];
		const blacklistedWord = status[msg.guild.settings.get('logs.moderation.blacklistedWord')];
		const blacklistedNickname = status[msg.guild.settings.get('logs.moderation.blacklistedNickname')];

		const embed = new MessageEmbed()
			.setAuthor(msg.language.get('COMMAND_MODERATION_SHOW_TITLE'), this.client.user.displayAvatarURL())
			.setDescription(msg.language.get('COMMAND_LOGS_SHOW_DESCRIPTION'))
			.setColor(this.client.settings.get('colors.white'))
			.addField(msg.language.get('COMMAND_MODERATION_SHOW_NOTIFYUSER'), notifyUser)
			.addField(msg.language.get('COMMAND_MODERATION_SHOW_PURGE'), purge, true)
			.addField(msg.language.get('COMMAND_MODERATION_SHOW_WARN'), warn, true)
			.addField(msg.language.get('COMMAND_MODERATION_SHOW_MUTE'), mute, true)
			.addField(msg.language.get('COMMAND_MODERATION_SHOW_UNMUTE'), unmute, true)
			.addField(msg.language.get('COMMAND_MODERATION_SHOW_KICK'), kick, true)
			.addField(msg.language.get('COMMAND_MODERATION_SHOW_SOFTBAN'), softban, true)
			.addField(msg.language.get('COMMAND_MODERATION_SHOW_BAN'), ban, true)
			.addField(msg.language.get('COMMAND_MODERATION_SHOW_UNBAN'), unban, true)
			.addField(msg.language.get('COMMAND_MODERATION_SHOW_VCKICK'), vckick, true)
			.addField(msg.language.get('COMMAND_MODERATION_SHOW_VCBAN'), vcban, true)
			.addField(msg.language.get('COMMAND_MODERATION_SHOW_VCUNBAN'), vcunban, true)
			.addField(msg.language.get('COMMAND_MODERATION_SHOW_ANTIINVITE'), antiInvite, true)
			.addField(msg.language.get('COMMAND_MODERATION_SHOW_MENTIONSPAM'), mentionSpam, true)
			.addField(msg.language.get('COMMAND_MODERATION_SHOW_BLACKLISTEDWORD'), blacklistedWord, true)
			.addField(msg.language.get('COMMAND_MODERATION_SHOW_BLACKLISTEDNICKNAME'), blacklistedNickname, true)
			.setThumbnail(msg.guild.iconURL(), 50, 50)
			.setTimestamp()
			.setFooter(msg.language.get('COMMAND_REQUESTED_BY', msg), msg.author.displayAvatarURL());

		return msg.send('', { disableEveryone: true, embed: embed });
	}

	async enable(msg, [setting]) {
		if (!setting) return msg.reject(msg.language.get('COMMAND_MODERATION_NOSETTING', setting));

		setting = setting.toLowerCase();
		if (!enableDisableArr.includes(setting)) return msg.reject(msg.language.get('COMMAND_MODERATION_ENABLE_ONLYSPECIFIED'));

		const notifyUser = msg.guild.settings.get('moderation.notifyUser');
		const purge = msg.guild.settings.get('logs.moderation.purge');
		const warn = msg.guild.settings.get('logs.moderation.warn');
		const mute = msg.guild.settings.get('logs.moderation.mute');
		const unmute = msg.guild.settings.get('logs.moderation.unmute');
		const kick = msg.guild.settings.get('logs.moderation.kick');
		const softban = msg.guild.settings.get('logs.moderation.softban');
		const ban = msg.guild.settings.get('logs.moderation.ban');
		const unban = msg.guild.settings.get('logs.moderation.unban');
		const vckick = msg.guild.settings.get('logs.moderation.vckick');
		const vcban = msg.guild.settings.get('logs.moderation.vcban');
		const vcunban = msg.guild.settings.get('logs.moderation.vcunban');
		const antiInvite = msg.guild.settings.get('logs.moderation.antiInvite');
		const mentionSpam = msg.guild.settings.get('logs.moderation.mentionSpam');
		const blacklistedWord = msg.guild.settings.get('logs.moderation.blacklistedWord');
		const blacklistedNickname = msg.guild.settings.get('logs.moderation.blacklistedNickname');

		if (setting === 'notify' && notifyUser) return msg.reject(msg.language.get('COMMAND_MODERATION_ENABLE_ALREADYENABLED', setting));
		if (setting === 'purge' && purge) return msg.reject(msg.language.get('COMMAND_MODERATION_ENABLE_ALREADYENABLED', setting));
		if (setting === 'warn' && warn) return msg.reject(msg.language.get('COMMAND_MODERATION_ENABLE_ALREADYENABLED', setting));
		if (setting === 'mute' && mute) return msg.reject(msg.language.get('COMMAND_MODERATION_ENABLE_ALREADYENABLED', setting));
		if (setting === 'unmute' && unmute) return msg.reject(msg.language.get('COMMAND_MODERATION_ENABLE_ALREADYENABLED', setting));
		if (setting === 'kick' && kick) return msg.reject(msg.language.get('COMMAND_MODERATION_ENABLE_ALREADYENABLED', setting));
		if (setting === 'softban' && softban) return msg.reject(msg.language.get('COMMAND_MODERATION_ENABLE_ALREADYENABLED', setting));
		if (setting === 'ban' && ban) return msg.reject(msg.language.get('COMMAND_MODERATION_ENABLE_ALREADYENABLED', setting));
		if (setting === 'unban' && unban) return msg.reject(msg.language.get('COMMAND_MODERATION_ENABLE_ALREADYENABLED', setting));
		if (setting === 'vckick' && vckick) return msg.reject(msg.language.get('COMMAND_MODERATION_ENABLE_ALREADYENABLED', setting));
		if (setting === 'vcban' && vcban) return msg.reject(msg.language.get('COMMAND_MODERATION_ENABLE_ALREADYENABLED', setting));
		if (setting === 'vcunban' && vcunban) return msg.reject(msg.language.get('COMMAND_MODERATION_ENABLE_ALREADYENABLED', setting));
		if (setting === 'antiinvite' && antiInvite) return msg.reject(msg.language.get('COMMAND_MODERATION_ENABLE_ALREADYENABLED', setting));
		if (setting === 'mentionspam' && mentionSpam) return msg.reject(msg.language.get('COMMAND_MODERATION_ENABLE_ALREADYENABLED', setting));
		if (setting === 'blacklistedword' && blacklistedWord) return msg.reject(msg.language.get('COMMAND_MODERATION_ENABLE_ALREADYENABLED', setting));
		if (setting === 'blacklistedname' && blacklistedNickname) return msg.reject(msg.language.get('COMMAND_MODERATION_ENABLE_ALREADYENABLED', setting));

		if (setting === 'notify') setting = 'notifyUser';
		if (setting === 'purge') setting = 'purge';
		if (setting === 'warn') setting = 'warn';
		if (setting === 'mute') setting = 'mute';
		if (setting === 'unmute') setting = 'unmute';
		if (setting === 'kick') setting = 'kick';
		if (setting === 'softban') setting = 'softban';
		if (setting === 'ban') setting = 'ban';
		if (setting === 'unban') setting = 'unban';
		if (setting === 'vckick') setting = 'vckick';
		if (setting === 'vcban') setting = 'vcban';
		if (setting === 'vcunban') setting = 'vcunban';
		if (setting === 'antiinvite') setting = 'antiInvite';
		if (setting === 'mentionspam') setting = 'mentionSpam';
		if (setting === 'blacklistedword') setting = 'blacklistedWord';
		if (setting === 'blacklistedname') setting = 'blacklistedNickname';

		if (setting === 'notifyUser') {
			await msg.guild.settings.update('logs.moderation.notifyUser', true);
		} else {
			await msg.guild.settings.update(`logs.moderation.${setting}`, true);
		}

		return msg.affirm();
	}

	async disable(msg, [setting]) {
		if (!setting) return msg.reject(msg.language.get('COMMAND_MODERATION_NOSETTING', setting));

		setting = setting.toLowerCase();
		if (!enableDisableArr.includes(setting)) return msg.reject(msg.language.get('COMMAND_MODERATION_DISABLE_ONLYSPECIFIED'));

		const notifyUser = msg.guild.settings.get('moderation.notifyUser');
		const purge = msg.guild.settings.get('logs.moderation.purge');
		const warn = msg.guild.settings.get('logs.moderation.warn');
		const mute = msg.guild.settings.get('logs.moderation.mute');
		const unmute = msg.guild.settings.get('logs.moderation.unmute');
		const kick = msg.guild.settings.get('logs.moderation.kick');
		const softban = msg.guild.settings.get('logs.moderation.softban');
		const ban = msg.guild.settings.get('logs.moderation.ban');
		const unban = msg.guild.settings.get('logs.moderation.unban');
		const vckick = msg.guild.settings.get('logs.moderation.vckick');
		const vcban = msg.guild.settings.get('logs.moderation.vcban');
		const vcunban = msg.guild.settings.get('logs.moderation.vcunban');
		const antiInvite = msg.guild.settings.get('logs.moderation.antiInvite');
		const mentionSpam = msg.guild.settings.get('logs.moderation.mentionSpam');
		const blacklistedWord = msg.guild.settings.get('logs.moderation.blacklistedWord');
		const blacklistedNickname = msg.guild.settings.get('logs.moderation.blacklistedNickname');

		if (setting === 'notify' && !notifyUser) return msg.reject(msg.language.get('COMMAND_MODERATION_DISABLE_ALREADYDISABLED', setting));
		if (setting === 'purge' && !purge) return msg.reject(msg.language.get('COMMAND_MODERATION_DISABLE_ALREADYDISABLED', setting));
		if (setting === 'warn' && !warn) return msg.reject(msg.language.get('COMMAND_MODERATION_DISABLE_ALREADYDISABLED', setting));
		if (setting === 'mute' && !mute) return msg.reject(msg.language.get('COMMAND_MODERATION_DISABLE_ALREADYDISABLED', setting));
		if (setting === 'unmute' && !unmute) return msg.reject(msg.language.get('COMMAND_MODERATION_DISABLE_ALREADYDISABLED', setting));
		if (setting === 'kick' && !kick) return msg.reject(msg.language.get('COMMAND_MODERATION_DISABLE_ALREADYDISABLED', setting));
		if (setting === 'softban' && !softban) return msg.reject(msg.language.get('COMMAND_MODERATION_DISABLE_ALREADYDISABLED', setting));
		if (setting === 'ban' && !ban) return msg.reject(msg.language.get('COMMAND_MODERATION_DISABLE_ALREADYDISABLED', setting));
		if (setting === 'unban' && !unban) return msg.reject(msg.language.get('COMMAND_MODERATION_DISABLE_ALREADYDISABLED', setting));
		if (setting === 'vckick' && !vckick) return msg.reject(msg.language.get('COMMAND_MODERATION_DISABLE_ALREADYDISABLED', setting));
		if (setting === 'vcban' && !vcban) return msg.reject(msg.language.get('COMMAND_MODERATION_DISABLE_ALREADYDISABLED', setting));
		if (setting === 'vcunban' && !vcunban) return msg.reject(msg.language.get('COMMAND_MODERATION_DISABLE_ALREADYDISABLED', setting));
		if (setting === 'antiinvite' && !antiInvite) return msg.reject(msg.language.get('COMMAND_MODERATION_DISABLE_ALREADYDISABLED', setting));
		if (setting === 'mentionspam' && !mentionSpam) return msg.reject(msg.language.get('COMMAND_MODERATION_DISABLE_ALREADYDISABLED', setting));
		if (setting === 'blacklistedword' && !blacklistedWord) return msg.reject(msg.language.get('COMMAND_MODERATION_DISABLE_ALREADYDISABLED', setting));
		if (setting === 'blacklistedname' && !blacklistedNickname) return msg.reject(msg.language.get('COMMAND_MODERATION_DISABLE_ALREADYDISABLED', setting));

		if (setting === 'notify') setting = 'notifyUser';
		if (setting === 'purge') setting = 'purge';
		if (setting === 'warn') setting = 'warn';
		if (setting === 'mute') setting = 'mute';
		if (setting === 'unmute') setting = 'unmute';
		if (setting === 'kick') setting = 'kick';
		if (setting === 'softban') setting = 'softban';
		if (setting === 'ban') setting = 'ban';
		if (setting === 'unban') setting = 'unban';
		if (setting === 'vckick') setting = 'vckick';
		if (setting === 'vcban') setting = 'vcban';
		if (setting === 'vcunban') setting = 'vcunban';
		if (setting === 'antiinvite') setting = 'antiInvite';
		if (setting === 'mentionspam') setting = 'mentionSpam';
		if (setting === 'blacklistedword') setting = 'blacklistedWord';
		if (setting === 'blacklistedname') setting = 'blacklistedNickname';

		if (setting === 'notifyUser') {
			await msg.guild.settings.update('moderation.notifyUser', false);
		} else {
			await msg.guild.settings.update(`logs.moderation.${setting}`, false);
		}

		return msg.affirm();
	}

};
