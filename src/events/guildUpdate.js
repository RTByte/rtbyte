const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');
const moment = require('moment');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'guildUpdate' });
		this.defaultMsgNotif = {
			ALL: 'All Messages',
			MENTIONS: 'Only @mentions'
		};
		this.filterLevels = [
			'Off',
			'On for unroled users',
			'On for everyone'
		];
		this.regions = {
			brazil: '🇧🇷 Brazil',
			'vip-us-west': '🇺🇸 VIP US West',
			'us-west': '🇺🇸 US West',
			japan: '🇯🇵 Japan',
			singapore: '🇸🇬 Singapore',
			'eu-central': '🇪🇺 EU Central',
			hongkong: '🇭🇰 Hong Kong',
			'vip-amsterdam': '🇳🇱 VIP Amsterdam',
			'us-south': '🇺🇸 US South',
			southafrica: '🇿🇦 South Africa',
			'vip-us-east': '🇺🇸 VIP US East',
			'us-central': '🇺🇸 US Central',
			london: '🇬🇧 London',
			'us-east': '🇺🇸 US East',
			sydney: '🇦🇺 Sydney',
			'eu-west': '🇪🇺 EU West',
			amsterdam: '🇳🇱 Amsterdam',
			frankfurt: '🇩🇪 Frankfurt',
			russia: '🇷🇺 Russia'
		};
		this.verificationLevels = [
			'None',
			'Low',
			'Medium',
			'(╯°□°）╯︵ ┻━┻',
			'┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻'
		];
	}

	async run(oldGuild, guild) {
		if (this.client.settings.logs.guildCreate) await this.globalGuildUpdateLog(oldGuild, guild);
		if (guild.available && guild.settings.logs.events.guildUpdate) await this.guildUpdateLog(oldGuild, guild);

		return;
	}

	async guildUpdateLog(oldGuild, guild) {
		const affirmEmoji = this.client.emojis.get(this.client.settings.emoji.affirm);
		const rejectEmoji = this.client.emojis.get(this.client.settings.emoji.reject);
		const arrowRightEmoji = this.client.emojis.get(this.client.settings.emoji.arrowRight);
		const status = [
			rejectEmoji,
			affirmEmoji
		];

		const embed = new MessageEmbed()
			.setAuthor(guild.name, guild.iconURL())
			.setColor(this.client.settings.colors.blue)
			.setTimestamp()
			.setFooter(guild.language.get('GUILD_LOG_GUILDUPDATE'));

		// eslint-disable-next-line max-len
		if (oldGuild.afkChannel !== guild.afkChannel) await embed.addField(guild.language.get('GUILD_LOG_GUILDUPDATE_AFKCHANNEL'), `${oldGuild.afkChannel ? oldGuild.afkChannel : 'No AFK Channel'} ${arrowRightEmoji} ${guild.afkChannel ? guild.afkChannel : 'No AFK Channel'}`);
		// eslint-disable-next-line max-len
		if (oldGuild.afkTimeout !== guild.afkTimeout) await embed.addField(guild.language.get('GUILD_LOG_GUILDUPDATE_AFKTIMEOUT'), `${moment.duration(oldGuild.afkTimeout, 'seconds').humanize()} ${arrowRightEmoji} ${moment.duration(guild.afkTimeout, 'seconds').humanize()}`);
		// eslint-disable-next-line max-len
		if (oldGuild.defaultMessageNotifications !== guild.defaultMessageNotifications) await embed.addField(guild.language.get('GUILD_LOG_GUILDUPDATE_DEFAULTMSGNOTIF'), `${this.defaultMsgNotif[oldGuild.defaultMessageNotifications]} ${arrowRightEmoji} ${this.defaultMsgNotif[guild.defaultMessageNotifications]}`);
		// eslint-disable-next-line max-len
		if (oldGuild.explicitContentFilter !== guild.explicitContentFilter) await embed.addField(guild.language.get('GUILD_LOG_GUILDUPDATE_CONTENTFILTER'), `${this.filterLevels[oldGuild.explicitContentFilter]} ${arrowRightEmoji} ${this.filterLevels[guild.explicitContentFilter]}`);
		if (oldGuild.iconURL() !== guild.iconURL()) await embed.setTitle(guild.language.get('GUILD_LOG_GUILDUPDATE_ICON'));
		if (oldGuild.mfaLevel !== guild.mfaLevel) await embed.addField(guild.language.get('GUILD_LOG_GUILDUPDATE_MFALEVEL'), status[guild.mfaLevel]);
		if (oldGuild.name !== guild.name) await embed.addField(guild.language.get('GUILD_LOG_GUILDUPDATE_NAME'), oldGuild.name);
		if (oldGuild.owner !== guild.owner) await embed.addField(guild.language.get('GUILD_LOG_GUILDUPDATE_OWNER'), `${oldGuild.owner} ${arrowRightEmoji} ${guild.owner}`);
		if (oldGuild.region !== guild.region) await embed.addField(guild.language.get('GUILD_LOG_GUILDUPDATE_REGION'), `${this.regions[oldGuild.region]} ${arrowRightEmoji} ${this.regions[guild.region]}`);
		if (oldGuild.splashURL !== guild.splashURL) {
			await embed.setTitle(guild.language.get('GUILD_LOG_GUILDUPDATE_SPLASH'));
			await embed.setImage(guild.splashURL);
		}
		// eslint-disable-next-line max-len
		if (oldGuild.verificationLevel !== guild.verificationLevel) await embed.addField(guild.language.get('GUILD_LOG_GUILDUPDATE_VLEVEL'), `${this.verificationLevels[oldGuild.verificationLevel]} ${arrowRightEmoji} ${this.verificationLevels[guild.verificationLevel]}`);

		const logChannel = await this.client.channels.get(guild.settings.channels.log);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

	async globalGuildUpdateLog(oldGuild, guild) {
		const embed = new MessageEmbed()
			.setAuthor(`${guild.name} (${guild.id})`, guild.iconURL())
			.setColor(this.client.settings.colors.blue)
			.setTimestamp();

		if (oldGuild.name !== guild.name) {
			await embed.addField(guild.language.get('GLOBAL_LOG_GUILDUPDATE_PREVNAME'), oldGuild);
			await embed.setFooter(guild.language.get('GLOBAL_LOG_GUILDUPDATE_NAME'));
		}
		if (oldGuild.iconURL() !== guild.iconURL()) {
			await embed.setFooter(guild.language.get('GLOBAL_LOG_GUILDUPDATE_ICON'));
		}

		if (oldGuild.name !== guild.name || oldGuild.iconURL() !== guild.iconURL()) {
			const globalLogChannel = await this.client.channels.get(this.client.settings.channels.globalLog);
			await globalLogChannel.send('', { disableEveryone: true, embed: embed });
			return;
		}
	}

};
