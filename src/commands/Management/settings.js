/* eslint-disable complexity */
const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const moment = require('moment-timezone');

const rolesArr = ['admin', 'mod', 'muted', 'vcbanned', 'joinable'];

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			permissionLevel: 7,
			description: language => language.get('COMMAND_SETTINGS_DESCRIPTION'),
			runIn: ['text'],
			subcommands: true,
			// eslint-disable-next-line max-len
			usage: '<enable|disable|set|remove|reset|show:default> [prefix|language|units|timezone|commandanalytics|devsaresuperusers|sinfoextendedoutput|roles] [admin|mod|muted|vcbanned|joinable] [value:role|value:...str]',
			usageDelim: ' '
		});
	}

	async show(msg) {
		const affirmEmoji = this.client.emojis.cache.get(this.client.settings.get('emoji.affirm'));
		const rejectEmoji = this.client.emojis.cache.get(this.client.settings.get('emoji.reject'));
		const status = {
			true: affirmEmoji,
			false: rejectEmoji
		};
		const language = {
			'en-US': 'English'
		};

		const measurementUnits = msg.guild.settings.get('measurementUnits') === 'metric' ?
			msg.language.get('COMMAND_SETTINGS_SHOW_MEASUREMENTUNITS_METRIC') :
			msg.language.get('COMMAND_SETTINGS_SHOW_MEASUREMENTUNITS_IMPERIAL');
		const timezone = msg.guild.settings.get('timezone');
		const serverLanguage = language[msg.guild.settings.get('language')];
		const prefix = msg.guild.settings.get('prefix');
		const commandAnalytics = status[msg.guild.settings.get('developmentSettings.commandAnalytics')];
		const developersAreSuperUsers = status[msg.guild.settings.get('developmentSettings.developersAreSuperUsers')];
		const serverinfoExtendedOutput = status[msg.guild.settings.get('commands.serverinfoExtendedOutput')];
		const administrator = msg.guild.roles.cache.get(msg.guild.settings.get('roles.administrator')) || msg.language.get('NOT_SET');
		const moderator = msg.guild.roles.cache.get(msg.guild.settings.get('roles.moderator')) || msg.language.get('NOT_SET');
		const muted = msg.guild.roles.cache.get(msg.guild.settings.get('roles.muted')) || msg.language.get('NOT_SET');
		const voiceBanned = msg.guild.roles.cache.get(msg.guild.settings.get('roles.voiceBanned')) || msg.language.get('NOT_SET');
		const joinable = msg.guild.settings.get('roles.joinable').map(role => msg.guild.roles.cache.get(role)).join(', ') || msg.language.get('NONE');

		const embed = new MessageEmbed()
			.setAuthor(msg.language.get('COMMAND_SETTINGS_SHOW_TITLE'), this.client.user.displayAvatarURL())
			.setDescription(msg.language.get('COMMAND_MANAGEMENT_SHOW_DESCRIPTION'))
			.setColor(this.client.settings.get('colors.white'))
			.addField(msg.language.get('COMMAND_SETTINGS_SHOW_PREFIX'), `\`${prefix}\``, true)
			.addField(msg.language.get('COMMAND_SETTINGS_SHOW_LANGUAGE'), serverLanguage, true)
			.addField(msg.language.get('COMMAND_SETTINGS_SHOW_MEASUREMENTUNITS'), measurementUnits, true)
			.addField(msg.language.get('COMMAND_SETTINGS_SHOW_TIMEZONE'), timezone, true)
			.addField(msg.language.get('COMMAND_SETTINGS_SHOW_COMMANDANALYTICS'), commandAnalytics, true)
			.addField(msg.language.get('COMMAND_SETTINGS_SHOW_DEVELOPERSARESUPERUSERS'), developersAreSuperUsers)
			.addField(msg.language.get('COMMAND_SETTINGS_SHOW_SERVERINFOEXTENDEDOUTPUT'), serverinfoExtendedOutput)
			.addField(msg.language.get('COMMAND_SETTINGS_SHOW_ADMINISTRATOR'), administrator, true)
			.addField(msg.language.get('COMMAND_SETTINGS_SHOW_MODERATOR'), moderator, true)
			.addField(msg.language.get('COMMAND_SETTINGS_SHOW_MUTED'), muted, true)
			.addField(msg.language.get('COMMAND_SETTINGS_SHOW_VOICEBANNED'), voiceBanned, true)
			.addField(msg.language.get('COMMAND_SETTINGS_SHOW_JOINABLE'), joinable)
			.setThumbnail(msg.guild.iconURL(), 50, 50)
			.setTimestamp()
			.setFooter(msg.language.get('COMMAND_REQUESTED_BY', msg), msg.author.displayAvatarURL());

		return msg.send('', { disableEveryone: true, embed: embed });
	}

	async enable(msg, [setting]) {
		if (!setting) return msg.reject(msg.language.get('COMMAND_SETTINGS_ENABLE_NOSETTING'));

		setting = setting.toLowerCase();
		if (!['commandanalytics', 'devsaresuperusers', 'sinfoextendedoutput'].includes(setting)) return msg.reject(msg.language.get('COMMAND_SETTINGS_ENABLE_ONLYSELECTED'));

		const commandAnalytics = msg.guild.settings.get('developmentSettings.commandAnalytics');
		const developersAreSuperUsers = msg.guild.settings.get('developmentSettings.developersAreSuperUsers');
		const serverinfoExtendedOutput = msg.guild.settings.get('commands.serverinfoExtendedOutput');

		if (setting === 'commandanalytics') setting = 'commandAnalytics';
		if (setting === 'devsaresuperusers') setting = 'developersAreSuperUsers';
		if (setting === 'sinfoextendedoutput') setting = 'serverinfoExtendedOutput';

		if (setting === 'commandAnalytics' && commandAnalytics) return msg.reject(msg.language.get('COMMAND_SETTINGS_ENABLE_ALREADYENABLED_COMMANDANALYTICS'));
		if (setting === 'developersAreSuperUsers' && developersAreSuperUsers) return msg.reject(msg.language.get('COMMAND_SETTINGS_ENABLE_ALREADYENABLED_DEVELOPERSARESUPERUSERS'));
		if (setting === 'serverinfoExtendedOutput' && serverinfoExtendedOutput) return msg.reject(msg.language.get('COMMAND_SETTINGS_ENABLE_ALREADYENABLED_SERVERINFOEXTENDEDOUTPUT'));

		if (setting === 'serverinfoExtendedOutput') {
			await msg.guild.settings.update(`commands.${setting}`, true);
		} else {
			await msg.guild.settings.update(`developmentSettings.${setting}`, true);
		}

		return msg.affirm();
	}

	async disable(msg, [setting]) {
		if (!setting) return msg.reject(msg.language.get('COMMAND_SETTINGS_DISABLE_NOSETTING'));

		setting = setting.toLowerCase();
		if (!['commandanalytics', 'devsaresuperusers', 'sinfoextendedoutput'].includes(setting)) return msg.reject(msg.language.get('COMMAND_SETTINGS_DISABLE_ONLYSELECTED'));

		const commandAnalytics = msg.guild.settings.get('developmentSettings.commandAnalytics');
		const developersAreSuperUsers = msg.guild.settings.get('developmentSettings.developersAreSuperUsers');
		const serverinfoExtendedOutput = msg.guild.settings.get('commands.serverinfoExtendedOutput');

		if (setting === 'commandanalytics') setting = 'commandAnalytics';
		if (setting === 'devsaresuperusers') setting = 'developersAreSuperUsers';
		if (setting === 'sinfoextendedoutput') setting = 'serverinfoExtendedOutput';

		if (setting === 'commandAnalytics' && !commandAnalytics) return msg.reject(msg.language.get('COMMAND_SETTINGS_DISABLE_ALREADYDISABLED_COMMANDANALYTICS'));
		if (setting === 'developersAreSuperUsers' && !developersAreSuperUsers) return msg.reject(msg.language.get('COMMAND_SETTINGS_DISABLE_ALREADYDISABLED_DEVELOPERSARESUPERUSERS'));
		if (setting === 'serverinfoExtendedOutput' && !serverinfoExtendedOutput) return msg.reject(msg.language.get('COMMAND_SETTINGS_DISABLE_ALREADYDISABLED_SERVERINFOEXTENDEDOUTPUT'));

		if (setting === 'serverinfoExtendedOutput') {
			await msg.guild.settings.update(`commands.${setting}`, false);
		} else {
			await msg.guild.settings.update(`developmentSettings.${setting}`, false);
		}

		return msg.affirm();
	}

	async set(msg, [setting, subsetting, value]) {
		if (!setting) return msg.reject(msg.language.get('COMMAND_SETTINGS_NOSETTING'));
		setting = setting.toLowerCase();

		if (!['prefix', 'language', 'units', 'timezone', 'roles'].includes(setting)) return msg.reject(msg.language.get('COMMAND_SETTINGS_SET_ONLYSPECIFIED'));
		if (['preifx', 'language', 'units', 'timezone'].includes(setting) && subsetting) return msg.reject(msg.language.get('COMMAND_SETTINGS_NOSUBSETTINGALLOWED'));
		if (setting === 'roles' && !rolesArr.includes(subsetting)) return msg.reject(msg.language.get('COMMAND_SETTINGS_NOTROLESUBSETTING'));

		if (setting === 'roles' && !subsetting) msg.reject(msg.language.get('COMMAND_SETTINGS_SET_NOTROLESUBSETTING'));
		if (subsetting) subsetting = subsetting.toLowerCase();

		if (setting === 'language' && !['english'].includes(value.toLowerCase())) return msg.reject(msg.language.get('COMMAND_SETTINGS_SET_NOVALUE_LANGUAGE'));
		if (setting === 'units' && !['metric', 'imperial'].includes(value.toLowerCase())) return msg.reject(msg.language.get('COMMAND_SETTINGS_SET_NOVALUE_UNITS'));
		if (setting === 'timezone' && !moment.tz.names().includes(value)) return msg.reject(msg.language.get('COMMAND_SETTINGS_SET_NOVALUE_TIMEZONE'));
		if (rolesArr.includes(subsetting) && !value) return msg.reject(msg.language.get('COMMAND_SETTINGS_NOVALUE_ROLES'));

		const measurementUnits = msg.guild.settings.get('measurementUnits');
		const timezone = msg.guild.settings.get('timezone');
		const serverLanguage = msg.guild.settings.get('language');
		const prefix = msg.guild.settings.get('prefix');
		const administrator = msg.guild.settings.get('roles.administrator');
		const moderator = msg.guild.settings.get('roles.moderator');
		const muted = msg.guild.settings.get('roles.muted');
		const voiceBanned = msg.guild.settings.get('roles.voiceBanned');
		const joinable = msg.guild.settings.get('roles.joinable');

		if (setting === 'units') setting = 'measurementUnits';
		if (setting === 'roles' && subsetting === 'admin') subsetting = 'administrator';
		if (setting === 'roles' && subsetting === 'mod') subsetting = 'moderator';
		if (setting === 'roles' && subsetting === 'vcbanned') subsetting = 'voiceBanned';

		if (setting === 'measurementUnits' && value === measurementUnits) return msg.reject(msg.language.get('COMMAND_SETTINGS_SET_MEASUREMENTUNITS_SAME_UNIT', value));
		if (setting === 'timezone' && value === timezone) return msg.reject(msg.language.get('COMMAND_SETTINGS_SET_TIMEZONE_SAME_TZ', value));
		if (setting === 'language' && value === serverLanguage) return msg.reject(msg.language.get('COMMAND_SETTINGS_SET_LANGUAGE_SAME_LANG', value));
		if (setting === 'prefix' && value === prefix) return msg.reject(msg.language.get('COMMAND_SETTINGS_SET_PREFIX_SAME_PREFIX', value));
		if (subsetting === 'administrator' && value.id === administrator) return msg.reject(msg.language.get('COMMAND_SETTINGS_SET_ROLES_ADMINISTRATOR_SAME_ROLE', value));
		if (subsetting === 'moderator' && value.id === moderator) return msg.reject(msg.language.get('COMMAND_SETTINGS_SET_ROLES_MODERATOR_SAME_ROLE', value));
		if (subsetting === 'muted' && value.id === muted) return msg.reject(msg.language.get('COMMAND_SETTINGS_SET_ROLES_MUTED_SAME_ROLE', value));
		if (subsetting === 'voiceBanned' && value.id === voiceBanned) return msg.reject(msg.language.get('COMMAND_SETTINGS_SET_ROLES_VOICEBANNED_SAME_ROLE', value));
		if (subsetting === 'joinable' && joinable.includes(value.id)) return msg.reject(msg.language.get('COMMAND_SETTINGS_SET_ROLES_JOINABLE_SAME_ROLE', value));

		if (setting === 'roles') {
			await msg.guild.settings.update(`roles.${subsetting}`, value, msg.guild);
		} else {
			await msg.guild.settings.update(setting, value);
		}

		return msg.affirm();
	}

	async remove(msg, [setting, subsetting, value]) {
		if (!setting) return msg.reject(msg.language.get('COMMAND_SETTINGS_REMOVE_NOSETTING'));
		setting = setting.toLowerCase();

		if (setting !== 'roles') return msg.reject(msg.language.get('COMMAND_SETTINGS_REMOVE_NOSETTING'));
		if (setting === 'roles' && subsetting !== 'joinable') return msg.reject(msg.language.get('COMMAND_SETTINGS_REMOVE_NOSETTING'));

		if (!subsetting) msg.reject(msg.language.get('COMMAND_SETTINGS_REMOVE_NOSETTING'));
		subsetting = subsetting.toLowerCase();

		if (!value) return msg.reject(msg.language.get('COMMAND_SETTINGS_NOVALUE_ROLES'));

		const joinable = msg.guild.settings.get('roles.joinable');


		if (subsetting === 'joinable' && !joinable.includes(value.id)) return msg.reject(msg.language.get('COMMAND_SETTINGS_REMOVE_ROLE_NOTEXIST', value));

		await msg.guild.settings.update(`roles.${subsetting}`, value, msg.guild, { action: 'remove' });

		return msg.affirm();
	}

	async reset(msg, [setting, subsetting]) {
		if (!setting) return msg.reject(msg.language.get('COMMAND_SETTINGS_NOSETTING'));
		setting = setting.toLowerCase();

		if (!['prefix', 'language', 'units', 'timezone', 'roles'].includes(setting)) return msg.reject(msg.language.get('COMMAND_SETTINGS_RESET_ONLYSPECIFIED'));
		if (['prefix', 'language', 'units', 'timezone'].includes(setting) && subsetting) return msg.reject(msg.language.get('COMMAND_SETTINGS_NOSUBSETTINGALLOWED'));
		if (setting === 'roles' && !rolesArr.includes(subsetting)) return msg.reject(msg.language.get('COMMAND_SETTINGS_NOTROLESUBSETTING'));

		if (setting === 'roles' && !subsetting) msg.reject(msg.language.get('COMMAND_SETTINGS_SET_NOTROLESUBSETTING'));
		if (subsetting) subsetting = subsetting.toLowerCase();

		const measurementUnits = msg.guild.settings.get('measurementUnits');
		const timezone = msg.guild.settings.get('timezone');
		const serverLanguage = msg.guild.settings.get('language');
		const prefix = msg.guild.settings.get('prefix');
		const administrator = msg.guild.settings.get('roles.administrator');
		const moderator = msg.guild.settings.get('roles.moderator');
		const muted = msg.guild.settings.get('roles.muted');
		const voiceBanned = msg.guild.settings.get('roles.voiceBanned');
		const joinable = msg.guild.settings.get('roles.joinable');

		if (setting === 'units') setting = 'measurementUnits';
		if (setting === 'roles' && subsetting === 'admin') subsetting = 'administrator';
		if (setting === 'roles' && subsetting === 'mod') subsetting = 'moderator';
		if (setting === 'roles' && subsetting === 'vcbanned') subsetting = 'voiceBanned';

		if (setting === 'measurementUnits' && measurementUnits === 'metric') return msg.reject(msg.language.get('COMMAND_SETTINGS_RESET_MEASUREMENTUNITS'));
		if (setting === 'timezone' && timezone === 'Europe/London') return msg.reject(msg.language.get('COMMAND_SETTINGS_RESET_TIMEZONE'));
		if (setting === 'language' && serverLanguage === 'en-US') return msg.reject(msg.language.get('COMMAND_SETTINGS_RESET_LANGUAGE'));
		if (setting === 'prefix' && prefix === '-') return msg.reject(msg.language.get('COMMAND_SETTINGS_RESET_PREFIX'));
		if (subsetting === 'administrator' && !administrator) return msg.reject(msg.language.get('COMMAND_SETTINGS_RESET_ADMINISTRATOR'));
		if (subsetting === 'moderator' && !moderator) return msg.reject(msg.language.get('COMMAND_SETTINGS_RESET_MODERATOR'));
		if (subsetting === 'muted' && !muted) return msg.reject(msg.language.get('COMMAND_SETTINGS_RESET_MUTED'));
		if (subsetting === 'voiceBanned' && !voiceBanned) return msg.reject(msg.language.get('COMMAND_SETTINGS_RESET_VOICEBANNED'));
		if (subsetting === 'joinable' && !joinable.length) return msg.reject(msg.language.get('COMMAND_SETTINGS_RESET_JOINABLE'));

		if (setting === 'roles') {
			await msg.guild.settings.reset(`roles.${subsetting}`);
		} else {
			await msg.guild.settings.reset(setting);
		}

		return msg.affirm();
	}

};
