/* eslint-disable complexity */
const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

const enableDisableArr = ['blacklist', 'antiinvite', 'mentionspam', 'modbypass', 'deletion', 'blistchecknames'];
const punishmentArr = ['mute', 'kick', 'softban', 'ban'];
const inviteRegex = /^(discord.gg)\/.+[a-z]/g;

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			permissionLevel: 7,
			description: language => language.get('COMMAND_FILTERS_DESCRIPTION'),
			runIn: ['text'],
			subcommands: true,
			// eslint-disable-next-line max-len
			usage: '<enable|disable|set|remove|reset|show:default> [blacklist|antiinvite|mentionspam|modbypass|deletion|blistchecknames] [punishment|words|whitelist|threshold] [value:number|value:...str]',
			usageDelim: ' '
		});
	}

	async show(msg) {
		// Fetch required emojis and assiociate true or false with the corresponding one.
		const affirmEmoji = this.client.emojis.cache.get(this.client.settings.get('emoji.affirm'));
		const rejectEmoji = this.client.emojis.cache.get(this.client.settings.get('emoji.reject'));
		const status = {
			true: affirmEmoji,
			false: rejectEmoji
		};
		// Build punishment object for assigning langs to different values that can be returned.
		const punishment = {
			warn: msg.language.get('COMMAND_FILTERS_SHOW_PUNISHMENT_WARN'),
			mute: msg.language.get('COMMAND_FILTERS_SHOW_PUNISHMENT_MUTE'),
			kick: msg.language.get('COMMAND_FILTERS_SHOW_PUNISHMENT_KICK'),
			softban: msg.language.get('COMMAND_FILTERS_SHOW_PUNISHMENT_SOFTBAN'),
			ban: msg.language.get('COMMAND_FILTERS_SHOW_PUNISHMENT_BAN')
		};

		// Fetch and resolve relevant guild settings.
		const wordBlacklistEnabled = status[msg.guild.settings.get('filters.wordBlacklistEnabled')];
		const anitInviteEnabled = status[msg.guild.settings.get('filters.antiInviteEnabled')];
		const mentionSpamEnabled = status[msg.guild.settings.get('filters.mentionSpamEnabled')];
		const modBypass = status[msg.guild.settings.get('filters.modBypass')];
		const deletion = status[msg.guild.settings.get('filters.delete')];
		const wordBlacklistPunishment = punishment[msg.guild.settings.get('filters.wordBlacklistPunishment')] || msg.language.get('NOT_SET');
		const antiInvitePunishment = punishment[msg.guild.settings.get('filters.antiInvitePunishment')] || msg.language.get('NOT_SET');
		const mentionSpamPunishment = punishment[msg.guild.settings.get('filters.mentionSpamPunishment')] || msg.language.get('NOT_SET');
		const checkDisplayNames = status[msg.guild.settings.get('filters.checkDisplayNames')];
		const words = msg.guild.settings.get('filters.words').map(word => `\`${word}\``).join(', ') || msg.language.get('NONE');
		const inviteWhitelist = msg.guild.settings.get('filters.inviteWhitelist').map(invite => `• \`${invite}\``).join('\n') || msg.language.get('NONE');
		const mentionSpamThreshold = msg.guild.settings.get('filters.mentionSpamThreshold');


		// Build embed before sending.
		const embed = new MessageEmbed()
			.setAuthor(msg.language.get('COMMAND_FILTERS_SHOW_TITLE'), this.client.user.displayAvatarURL())
			.setColor(this.client.settings.get('colors.white'))
			.addField(msg.language.get('COMMAND_FILTERS_SHOW_MODBYPASS'), modBypass, true)
			.addField(msg.language.get('COMMAND_FILTERS_SHOW_DELETION'), deletion, true)
			.addField(msg.language.get('COMMAND_FILTERS_SHOW_WORDBLACKLIST'), wordBlacklistEnabled, true)
			.addField(msg.language.get('COMMAND_FILTERS_SHOW_CHECKNAMES'), checkDisplayNames, true)
			.addField(msg.language.get('COMMAND_FILTERS_SHOW_PUNISHMENT', 'blacklist'), wordBlacklistPunishment, true)
			.addField(msg.language.get('COMMAND_FILTERS_SHOW_WORDBLACKLIST_WORDS'), words)
			.addField(msg.language.get('COMMAND_FILTERS_SHOW_ANTIINVITE'), anitInviteEnabled, true)
			.addField(msg.language.get('COMMAND_FILTERS_SHOW_PUNISHMENT', 'antiinvite'), antiInvitePunishment, true)
			.addField(msg.language.get('COMMAND_FILTERS_SHOW_ANTIINVITE_WHITELIST'), inviteWhitelist)
			.addField(msg.language.get('COMMAND_FILTERS_SHOW_MENTIONSPAM'), mentionSpamEnabled, true)
			.addField(msg.language.get('COMMAND_FILTERS_SHOW_PUNISHMENT', 'mentionspam'), mentionSpamPunishment, true)
			.addField(msg.language.get('COMMAND_FILTERS_SHOW_MENTIONSPAM_THRESHOLD'), mentionSpamThreshold)
			.setThumbnail(msg.guild.iconURL(), 50, 50)
			.setTimestamp()
			.setFooter(msg.language.get('COMMAND_REQUESTED_BY', msg), msg.author.displayAvatarURL());

		return msg.send('', { disableEveryone: true, embed: embed });
	}

	async enable(msg, [setting]) {
		// If a setting hasn't been specified, stop process and inform user.
		if (!setting) return msg.reject(msg.language.get('COMMAND_FILTERS_ENABLE_NOSETTING'));

		// Set specified setting to lowercase and check if what user entered matches what we expect.
		setting = setting.toLowerCase();
		if (!enableDisableArr.includes(setting)) return msg.reject(msg.language.get('COMMAND_FILTERS_ENABLE_ONLYSELECTED'));

		// Fetch relevant guild settings.
		const wordBlacklistEnabled = msg.guild.settings.get('filters.wordBlacklistEnabled');
		const anitInviteEnabled = msg.guild.settings.get('filters.antiInviteEnabled');
		const mentionSpamEnabled = msg.guild.settings.get('filters.mentionSpamEnabled');
		const modBypass = msg.guild.settings.get('filters.modBypass');
		const deletion = msg.guild.settings.get('filters.delete');
		const checkDisplayNames = msg.guild.settings.get('filters.checkDisplayNames');

		// Check if the specified setting matches what we expect, then change the setting variable to what the config option is called.
		if (setting === 'blacklist') setting = 'wordBlacklistEnabled';
		if (setting === 'antiinvite') setting = 'antiInviteEnabled';
		if (setting === 'mentionspam') setting = 'mentionSpamEnabled';
		if (setting === 'modbypass') setting = 'modBypass';
		if (setting === 'deletion') setting = 'delete';
		if (setting === 'blistchecknames') setting = 'checkDisplayNames';

		// If specified boolean is already true, stop process and inform user.
		if (setting === 'wordBlacklistEnabled' && wordBlacklistEnabled) return msg.reject(msg.language.get('COMMAND_FILTERS_ENABLE_ALREADYENABLED_BLACKLIST'));
		if (setting === 'antiInviteEnabled' && anitInviteEnabled) return msg.reject(msg.language.get('COMMAND_FILTERS_ENABLE_ALREADYENABLED_ANTIINVITE'));
		if (setting === 'mentionSpamEnabled' && mentionSpamEnabled) return msg.reject(msg.language.get('COMMAND_FILTERS_ENABLE_ALREADYENABLED_MENTIONSPAM'));
		if (setting === 'modBypass' && modBypass) return msg.reject(msg.language.get('COMMAND_FILTERS_ENABLE_ALREADYENABLED_MODBYPASS'));
		if (setting === 'delete' && deletion) return msg.reject(msg.language.get('COMMAND_FILTERS_ENABLE_ALREADYENABLED_DELETION'));
		if (setting === 'checkDisplayNames' && checkDisplayNames) return msg.reject(msg.language.get('COMMAND_FILTERS_ENABLE_ALREADYENABLED_CHECKNAMES'));

		// Set the specified boolean to true.
		await msg.guild.settings.update(`filters.${setting}`, true);

		return msg.affirm();
	}

	async disable(msg, [setting]) {
		// If a setting hasn't been specified, stop process and inform user.
		if (!setting) return msg.reject(msg.language.get('COMMAND_FILTERS_DISABLE_NOSETTING'));

		// Set specified setting to lowercase and check if what user entered matches what we expect.
		setting = setting.toLowerCase();
		if (!enableDisableArr.includes(setting)) return msg.reject(msg.language.get('COMMAND_FILTERS_DISABLE_ONLYSELECTED'));

		// Fetch relevant guild settings.
		const wordBlacklistEnabled = msg.guild.settings.get('filters.wordBlacklistEnabled');
		const anitInviteEnabled = msg.guild.settings.get('filters.antiInviteEnabled');
		const mentionSpamEnabled = msg.guild.settings.get('filters.mentionSpamEnabled');
		const modBypass = msg.guild.settings.get('filters.modBypass');
		const deletion = msg.guild.settings.get('filters.delete');
		const checkDisplayNames = msg.guild.settings.get('filters.checkDisplayNames');

		// Check if the specified setting matches what we expect, then change the setting variable to what the config option is called.
		if (setting === 'blacklist') setting = 'wordBlacklistEnabled';
		if (setting === 'antiinvite') setting = 'antiInviteEnabled';
		if (setting === 'mentionspam') setting = 'mentionSpamEnabled';
		if (setting === 'modbypass') setting = 'modBypass';
		if (setting === 'deletion') setting = 'delete';
		if (setting === 'blistchecknames') setting = 'checkDisplayNames';

		// If specified boolean is already false, stop process and inform user.
		if (setting === 'wordBlacklistEnabled' && !wordBlacklistEnabled) return msg.reject(msg.language.get('COMMAND_FILTERS_DISABLE_ALREADYDISABLED_BLACKLIST'));
		if (setting === 'antiInviteEnabled' && !anitInviteEnabled) return msg.reject(msg.language.get('COMMAND_FILTERS_DISABLE_ALREADYDISABLED_ANTIINVITE'));
		if (setting === 'mentionSpamEnabled' && !mentionSpamEnabled) return msg.reject(msg.language.get('COMMAND_FILTERS_DISABLE_ALREADYDISABLED_MENTIONSPAM'));
		if (setting === 'modBypass' && !modBypass) return msg.reject(msg.language.get('COMMAND_FILTERS_DISABLE_ALREADYDISABLED_MODBYPASS'));
		if (setting === 'delete' && !deletion) return msg.reject(msg.language.get('COMMAND_FILTERS_DISABLE_ALREADYDISABLED_DELETION'));
		if (setting === 'checkDisplayNames' && !checkDisplayNames) return msg.reject(msg.language.get('COMMAND_FILTERS_DISABLE_ALREADYDISABLED_CHECKNAMES'));

		// Set the specified boolean to false.
		await msg.guild.settings.update(`filters.${setting}`, false);

		return msg.affirm();
	}

	async set(msg, [setting, subsetting, value]) {
		// If a setting hasn't been specified, stop process and inform user. Set specified setting to lowercase.
		if (!setting) return msg.reject(msg.language.get('COMMAND_FILTERS_NOSETTING'));
		setting = setting.toLowerCase();

		// If specified setting doesn't match what we expect, stop process and inform user.
		if (!['blacklist', 'antiinvite', 'mentionspam'].includes(setting)) return msg.reject(msg.language.get('COMMAND_FILTERS_NOSETTING'));
		// If specified setting is set but specified subsetting doesn't match what we expect, stop process and inform user.
		if (setting === 'blacklist' && !['punishment', 'words'].includes(subsetting)) return msg.reject(msg.language.get('COMMAND_FILTERS_NOSUBSETTING_BLACKLIST'));
		if (setting === 'antiinvite' && !['punishment', 'whitelist'].includes(subsetting)) return msg.reject(msg.language.get('COMMAND_FILTERS_NOSUBSETTING_ANTIINVITE'));
		if (setting === 'mentionspam' && !['punishment', 'threshold'].includes(subsetting)) return msg.reject(msg.language.get('COMMAND_FILTERS_NOSUBSETTING_MENTIONSPAM'));

		// If a subsetting hasn't been specified, stop process and inform user. Set specified subsetting to lowercase.
		if (!subsetting) msg.reject(msg.language.get('COMMAND_FILTERS_NOSETTING'));
		subsetting = subsetting.toLowerCase();

		// If specified subsetting is set but a value hasn't been specified, stop process and inform user.
		if (subsetting === 'punishment' && !punishmentArr.includes(value)) return msg.reject(msg.language.get('COMMAND_FILTERS_NOVALUE_PUNISHMENT'));
		if (subsetting === 'words' && !value) return msg.reject(msg.language.get('COMMAND_FILTERS_NOVALUE_WORDS'));
		if (subsetting === 'whitelist' && !value) return msg.reject(msg.language.get('COMMAND_FILTERS_NOVALUE_WHITELIST'));
		if (subsetting === 'threshold' && !value) return msg.reject(msg.language.get('COMMAND_FILTERS_NOVALUE_NUMBER'));

		// If specified subsetting is set and value is provided but is of incorrect type, stop process and inform user.
		if (subsetting === 'whitelist' && !value.match(inviteRegex)) return msg.reject(msg.language.get('COMMAND_FILTERS_NOVALUE_WHITELIST'));
		if (subsetting === 'threshold' && !Number.isInteger(value)) return msg.reject(msg.language.get('COMMAND_FILTERS_NOVALUE_NUMBER'));

		// Fetch relevant guild settings.
		const wordBlacklistPunishment = msg.guild.settings.get('filters.wordBlacklistPunishment');
		const antiInvitePunishment = msg.guild.settings.get('filters.antiInvitePunishment');
		const mentionSpamPunishment = msg.guild.settings.get('filters.mentionSpamPunishment');
		const words = msg.guild.settings.get('filters.words');
		const inviteWhitelist = msg.guild.settings.get('filters.inviteWhitelist');
		const mentionSpamThreshold = msg.guild.settings.get('filters.mentionSpamThreshold');

		// Check if the specified setting and subsetting match what we expect, then change the setting variable to what the config option is called.
		if (setting === 'blacklist' && subsetting === 'punishment') subsetting = 'wordBlacklistPunishment';
		if (setting === 'antiinvite' && subsetting === 'punishment') subsetting = 'antiInvitePunishment';
		if (setting === 'mentionspam' && subsetting === 'punishment') subsetting = 'mentionSpamPunishment';
		if (setting === 'blacklist' && subsetting === 'words') subsetting = 'words';
		if (setting === 'antiinvite' && subsetting === 'whitelist') subsetting = 'inviteWhitelist';
		if (setting === 'mentionspam' && subsetting === 'threshold') subsetting = 'mentionSpamThreshold';

		// If specified config option is already set to the same value, stop process and inform user.
		if (subsetting === 'wordBlacklistPunishment' && value === wordBlacklistPunishment) return msg.reject(msg.language.get('COMMAND_FILTERS_SET_BLACKLIST_SAME_PUNISHMENT', value));
		if (subsetting === 'antiInvitePunishment' && value === antiInvitePunishment) return msg.reject(msg.language.get('COMMAND_FILTERS_SET_ANTIINVITE_SAME_PUNISHMENT', value));
		if (subsetting === 'mentionSpamPunishment' && value === mentionSpamPunishment) return msg.reject(msg.language.get('COMMAND_FILTERS_SET_MENTIONSPAM_SAME_PUNISHMENT', value));
		if (subsetting === 'words' && words.includes(value)) return msg.reject(msg.language.get('COMMAND_FILTERS_SET_BLACKLIST_WORD_EXIST', value));
		if (subsetting === 'inviteWhitelist' && inviteWhitelist.includes(value)) return msg.reject(msg.language.get('COMMAND_FILTERS_SET_ANTIINVITE_INVITE_EXIST', value));
		if (subsetting === 'mentionSpamThreshold' && value === mentionSpamThreshold) return msg.reject(msg.language.get('COMMAND_FILTERS_SET_MENTIONSPAM_SAME_THRESHOLD', value));

		// Update specified config option.
		await msg.guild.settings.update(`filters.${subsetting}`, value);

		return msg.affirm();
	}

	async remove(msg, [setting, subsetting, value]) {
		// If a setting hasn't been specified, stop process and inform user. Set specified setting to lowercase.
		if (!setting) return msg.reject(msg.language.get('COMMAND_FILTERS_REMOVE_NOSETTING'));
		setting = setting.toLowerCase();

		// If specified setting doesn't match what we expect, stop process and inform user.
		if (!['blacklist', 'antiinvite'].includes(setting)) return msg.reject(msg.language.get('COMMAND_FILTERS_REMOVE_NOSETTING'));
		// If specified setting is set but specified subsetting doesn't match what we expect, stop process and inform user.
		if (setting === 'blacklist' && subsetting !== 'words') return msg.reject(msg.language.get('COMMAND_FILTERS_NOVALUE_WORDS'));
		if (setting === 'antiinvite' && subsetting !== 'whitelist') return msg.reject(msg.language.get('COMMAND_FILTERS_NOVALUE_WHITELIST'));

		// If a subsetting hasn't been specified, stop process and inform user. Set specified subsetting to lowercase.
		if (!subsetting) msg.reject(msg.language.get('COMMAND_FILTERS_REMOVE_NOSETTING'));
		subsetting = subsetting.toLowerCase();

		// Fetch relevant guild settings.
		const words = msg.guild.settings.get('filters.words');
		const inviteWhitelist = msg.guild.settings.get('filters.inviteWhitelist');

		// Check if the specified setting and subsetting match what we expect, then change the setting variable to what the config option is called.
		if (setting === 'blacklist' && subsetting === 'words') subsetting = 'words';
		if (setting === 'antiinvite' && subsetting === 'whitelist') subsetting = 'inviteWhitelist';

		// If specified config option doesn't exist in relevant array, stop process and inform user.
		if (subsetting === 'words' && !words.includes(value)) return msg.reject(msg.language.get('COMMAND_FILTERS_REMOVE_BLACKLIST_WORD_NOTEXIST', value));
		if (subsetting === 'inviteWhitelist' && !inviteWhitelist.includes(value)) return msg.reject(msg.language.get('COMMAND_FILTERS_REMOVE_ANTIINVITE_INVITE_NOTEXIST', value));

		// Remove value from specified config option array.
		await msg.guild.settings.update(`filters.${subsetting}`, value, { action: 'remove' });

		return msg.affirm();
	}

	async reset(msg, [setting, subsetting]) {
		// If a setting hasn't been specified, stop process and inform user. Set specified setting to lowercase.
		if (!setting) return msg.reject(msg.language.get('COMMAND_FILTERS_NOSETTING'));
		setting = setting.toLowerCase();

		// If specified setting doesn't match what we expect, stop process and inform user.
		if (!['blacklist', 'antiinvite', 'mentionspam'].includes(setting)) return msg.reject(msg.language.get('COMMAND_FILTERS_NOSETTING'));
		// If specified setting is set but specified subsetting doesn't match what we expect, stop process and inform user.
		if (setting === 'blacklist' && !['punishment', 'words'].includes(subsetting)) return msg.reject(msg.language.get('COMMAND_FILTERS_NOSUBSETTING_BLACKLIST'));
		if (setting === 'antiinvite' && !['punishment', 'whitelist'].includes(subsetting)) return msg.reject(msg.language.get('COMMAND_FILTERS_NOSUBSETTING_ANTIINVITE'));
		if (setting === 'mentionspam' && !['punishment', 'threshold'].includes(subsetting)) return msg.reject(msg.language.get('COMMAND_FILTERS_NOSUBSETTING_MENTIONSPAM'));

		// If a subsetting hasn't been specified, stop process and inform user. Set specified subsetting to lowercase.
		if (!subsetting) msg.reject(msg.language.get('COMMAND_FILTERS_NOSETTING'));
		subsetting = subsetting.toLowerCase();

		// Fetch relevant guild settings.
		const wordBlacklistPunishment = msg.guild.settings.get('filters.wordBlacklistPunishment');
		const antiInvitePunishment = msg.guild.settings.get('filters.antiInvitePunishment');
		const mentionSpamPunishment = msg.guild.settings.get('filters.mentionSpamPunishment');
		const words = msg.guild.settings.get('filters.words');
		const inviteWhitelist = msg.guild.settings.get('filters.inviteWhitelist');
		const mentionSpamThreshold = msg.guild.settings.get('filters.mentionSpamThreshold');

		// Check if the specified setting and subsetting match what we expect, then change the setting variable to what the config option is called.
		if (setting === 'blacklist' && subsetting === 'punishment') subsetting = 'wordBlacklistPunishment';
		if (setting === 'antiinvite' && subsetting === 'punishment') subsetting = 'antiInvitePunishment';
		if (setting === 'mentionspam' && subsetting === 'punishment') subsetting = 'mentionSpamPunishment';
		if (setting === 'blacklist' && subsetting === 'words') subsetting = 'words';
		if (setting === 'antiinvite' && subsetting === 'whitelist') subsetting = 'inviteWhitelist';
		if (setting === 'mentionspam' && subsetting === 'threshold') subsetting = 'mentionSpamThreshold';

		// If specified config option hasn't been set, stop process and inform user.
		if (subsetting === 'wordBlacklistPunishment' && !wordBlacklistPunishment) return msg.reject(msg.language.get('COMMAND_FILTERS_RESET_BLACKLIST_PUNISHMENT'));
		if (subsetting === 'antiInvitePunishment' && !antiInvitePunishment) return msg.reject(msg.language.get('COMMAND_FILTERS_RESET_ANTIINVITE_PUNISHMENT'));
		if (subsetting === 'mentionSpamPunishment' && !mentionSpamPunishment) msg.reject(msg.language.get('COMMAND_FILTERS_RESET_MENTIONSPAM_PUNISHMENT'));
		if (subsetting === 'words' && !words.length) msg.reject(msg.language.get('COMMAND_FILTERS_RESET_BLACKLIST_WORDS'));
		if (subsetting === 'inviteWhitelist' && !inviteWhitelist.length) msg.reject(msg.language.get('COMMAND_FILTERS_RESET_ANTIINVITE_WHITELIST'));
		if (subsetting === 'mentionSpamThreshold' && mentionSpamThreshold === 12) msg.reject(msg.language.get('COMMAND_FILTERS_RESET_MENTIONSPAM_THRESHOLD'));

		// Reset specified config option.
		await msg.guild.settings.reset(`filters.${subsetting}`);

		return msg.affirm();
	}

};
