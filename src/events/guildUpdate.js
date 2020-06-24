/* eslint-disable complexity */
const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');
const { momentThreshold } = require('../lib/util/Util');
const moment = require('moment');

momentThreshold(moment);

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'guildUpdate' });
	}

	async run(oldGuild, guild) {
		if (!guild) return;

		let executor;
		if (guild.me.hasPermission('VIEW_AUDIT_LOG')) {
			const auditLog = await guild.fetchAuditLogs();
			const logEntry = await auditLog.entries.first();

			if (logEntry.action === 'GUILD_UPDATE') executor = logEntry ? logEntry.executor : undefined;
		}

		if (this.client.settings.get('logs.guildUpdate')) await this.globalLog(oldGuild, guild);
		if (guild.settings.get('channels.log') && guild.settings.get('logs.events.guildUpdate')) await this.serverLog(oldGuild, guild, executor);

		if (oldGuild.premiumTier !== guild.premiumTier) this.client.emit('guildBoostTierUpdate', guild);

		return;
	}

	async serverLog(oldGuild, guild, executor) {
		const affirmEmoji = this.client.emojis.get(this.client.settings.get('emoji.affirm'));
		const rejectEmoji = this.client.emojis.get(this.client.settings.get('emoji.reject'));
		const arrowRightEmoji = this.client.emojis.get(this.client.settings.get('emoji.arrowRight'));
		const arrayStatus = [
			rejectEmoji,
			affirmEmoji
		];
		const booleanStatus = {
			true: affirmEmoji,
			false: rejectEmoji
		};
		const oldVanityURL = `discord.gg/${oldGuild.vanityURLCode}`;
		const newVanityURL = `discord.gg/${guild.vanityURLCode}`;

		// Base embed
		const embed = new MessageEmbed()
			.setAuthor(guild.name, guild.iconURL())
			.setColor(this.client.settings.get('colors.blue'))
			.setTimestamp()
			.setFooter(guild.language.get('GUILD_LOG_GUILDUPDATE', executor), executor ? executor.displayAvatarURL() : undefined);

		// AFK channel changed
		// eslint-disable-next-line max-len
		if (oldGuild.afkChannel !== guild.afkChannel) await embed.addField(guild.language.get('GUILD_LOG_GUILDUPDATE_AFKCHANNEL'), `${oldGuild.afkChannel || guild.language.get('GUILD_LOG_GUILDUPDATE_AFKCHANNEL_NONE')} ${arrowRightEmoji} ${guild.afkChannel || guild.language.get('GUILD_LOG_GUILDUPDATE_AFKCHANNEL_NONE')}`);

		// AFK timeout changed
		// eslint-disable-next-line max-len
		if (oldGuild.afkTimeout !== guild.afkTimeout) await embed.addField(guild.language.get('GUILD_LOG_GUILDUPDATE_AFKTIMEOUT'), `${moment.duration(oldGuild.afkTimeout, 'seconds').humanize()} ${arrowRightEmoji} ${moment.duration(guild.afkTimeout, 'seconds').humanize()}`);

		// Default notification settings changed
		// eslint-disable-next-line max-len
		if (oldGuild.defaultMessageNotifications !== guild.defaultMessageNotifications) await embed.addField(guild.language.get('GUILD_LOG_GUILDUPDATE_DEFAULTMSGNOTIF'), `${guild.language.get('GUILD_LOG_GUILDUPDATE_DEFAULTMSGNOTIF_OLD', oldGuild)} ${arrowRightEmoji} ${guild.language.get('GUILD_LOG_GUILDUPDATE_DEFAULTMSGNOTIF_NEW', guild)}`);

		// Explicit content filter level changed
		// eslint-disable-next-line max-len
		if (oldGuild.explicitContentFilter !== guild.explicitContentFilter) await embed.addField(guild.language.get('GUILD_LOG_GUILDUPDATE_CONTENTFILTER'), `${guild.language.get('GUILD_LOG_GUILDUPDATE_CONTENTFILTER_OLD', oldGuild)} ${arrowRightEmoji} ${guild.language.get('GUILD_LOG_GUILDUPDATE_CONTENTFILTER_NEW', guild)}`);

		// Verification level changed
		// eslint-disable-next-line max-len
		if (oldGuild.verificationLevel !== guild.verificationLevel) await embed.addField(guild.language.get('GUILD_LOG_GUILDUPDATE_VLEVEL'), `${guild.language.get('GUILD_LOG_GUILDUPDATE_VLEVEL_OLD', oldGuild)} ${arrowRightEmoji} ${guild.language.get('GUILD_LOG_GUILDUPDATE_VLEVEL_NEW', guild)}`);

		// Icon changed
		if (oldGuild.iconURL() !== guild.iconURL()) await embed.setFooter(guild.language.get('GUILD_LOG_GUILDUPDATE_ICON', executor), executor ? executor.displayAvatarURL() : undefined);

		// 2FA requirement toggled
		if (oldGuild.mfaLevel !== guild.mfaLevel) await embed.addField(guild.language.get('GUILD_LOG_GUILDUPDATE_MFALEVEL'), arrayStatus[guild.mfaLevel]);

		// Name changed
		if (oldGuild.name !== guild.name) await embed.addField(guild.language.get('GUILD_LOG_GUILDUPDATE_NAME'), `${oldGuild.name} ${arrowRightEmoji} ${guild.name}`);

		// Ownership transferred
		if (oldGuild.owner !== guild.owner) await embed.addField(guild.language.get('GUILD_LOG_GUILDUPDATE_OWNER'), `${oldGuild.owner} ${arrowRightEmoji} ${guild.owner}`);

		// Region changed
		// eslint-disable-next-line max-len
		if (oldGuild.region !== guild.region) await embed.addField(guild.language.get('GUILD_LOG_GUILDUPDATE_REGION'), `${guild.language.get('REGION', oldGuild.region)} ${arrowRightEmoji} ${guild.language.get('REGION', guild.region)}`);

		// System messages channel changed
		// eslint-disable-next-line max-len
		if (oldGuild.systemChannel !== guild.systemChannel) await embed.addField(guild.language.get('GUILD_LOG_GUILDUPDATE_SYSMSGS'), `${oldGuild.systemChannel || guild.language.get('GUILD_LOG_GUILDUPDATE_SYSMSGS_NONE')} ${arrowRightEmoji} ${guild.systemChannel || guild.language.get('GUILD_LOG_GUILDUPDATE_SYSMSGS_NONE')}`);

		// Vanity URL changed
		// eslint-disable-next-line max-len
		if (oldGuild.vanityURLCode !== guild.vanityURLCode) await embed.addField(guild.language.get('GUILD_LOG_GUILDUPDATE_VANITYURL'), `${oldGuild.vanityURLCode ? oldVanityURL : guild.language.get('GUILD_LOG_GUILDUPDATE_VANITYURL_NONE')} ${arrowRightEmoji} ${guild.vanityURLCode ? newVanityURL : guild.language.get('GUILD_LOG_GUILDUPDATE_VANITYURL_NONE')}`);

		// Guild description changed
		// eslint-disable-next-line max-len
		if (oldGuild.description !== guild.description) await embed.addField(guild.language.get('GUILD_LOG_GUILDUPDATE_DESCRIPTION'), `${oldGuild.description || guild.language.get('GUILD_LOG_GUILDUPDATE_DESCRIPTION_NONE')} ${arrowRightEmoji} ${guild.description || guild.language.get('GUILD_LOG_GUILDUPDATE_DESCRIPTION_NONE')}`);

		// Widget channel changed
		// eslint-disable-next-line max-len
		if (oldGuild.widgetChannel !== guild.widgetChannel) await embed.addField(guild.language.get('GUILD_LOG_GUILDUPDATE_WIDGETCHANNEL'), `${oldGuild.widgetChannel || guild.language.get('GUILD_LOG_GUILDUPDATE_WIDGETCHANNEL_NONE')} ${arrowRightEmoji} ${guild.widgetChannel || guild.language.get('GUILD_LOG_GUILDUPDATE_WIDGETCHANNEL_NONE')}`);

		// Server widget toggled
		if (oldGuild.widgetEnabled !== guild.widgetEnabled) await embed.addField(guild.language.get('GUILD_LOG_GUILDUPDATE_WIDGET'), booleanStatus[guild.widgetEnabled]);

		if (oldGuild.systemChannelFlags.bitfield !== guild.systemChannelFlags.bitfield) {
			if (oldGuild.systemChannelFlags.bitfield === 0 && guild.systemChannelFlags.bitfield === 1) {
				await embed.addField(guild.language.get('GUILD_LOG_GUILDUPDATE_WELCOMEMESSAGES'), rejectEmoji);
			}
			if (oldGuild.systemChannelFlags.bitfield === 0 && guild.systemChannelFlags.bitfield === 2) {
				await embed.addField(guild.language.get('GUILD_LOG_GUILDUPDATE_BOOSTMESSAGES'), rejectEmoji);
			}
			if (oldGuild.systemChannelFlags.bitfield === 0 && guild.systemChannelFlags.bitfield === 3) {
				await embed.addField(guild.language.get('GUILD_LOG_GUILDUPDATE_WELCOMEMESSAGES'), rejectEmoji);
				await embed.addField(guild.language.get('GUILD_LOG_GUILDUPDATE_BOOSTMESSAGES'), rejectEmoji);
			}
			if (oldGuild.systemChannelFlags.bitfield === 1 && guild.systemChannelFlags.bitfield === 0) {
				await embed.addField(guild.language.get('GUILD_LOG_GUILDUPDATE_WELCOMEMESSAGES'), affirmEmoji);
			}
			if (oldGuild.systemChannelFlags.bitfield === 1 && guild.systemChannelFlags.bitfield === 2) {
				await embed.addField(guild.language.get('GUILD_LOG_GUILDUPDATE_WELCOMEMESSAGES'), affirmEmoji);
				await embed.addField(guild.language.get('GUILD_LOG_GUILDUPDATE_BOOSTMESSAGES'), rejectEmoji);
			}
			if (oldGuild.systemChannelFlags.bitfield === 1 && guild.systemChannelFlags.bitfield === 3) {
				await embed.addField(guild.language.get('GUILD_LOG_GUILDUPDATE_BOOSTMESSAGES'), rejectEmoji);
			}
			if (oldGuild.systemChannelFlags.bitfield === 2 && guild.systemChannelFlags.bitfield === 0) {
				await embed.addField(guild.language.get('GUILD_LOG_GUILDUPDATE_BOOSTMESSAGES'), affirmEmoji);
			}
			if (oldGuild.systemChannelFlags.bitfield === 2 && guild.systemChannelFlags.bitfield === 1) {
				await embed.addField(guild.language.get('GUILD_LOG_GUILDUPDATE_WELCOMEMESSAGES'), rejectEmoji);
				await embed.addField(guild.language.get('GUILD_LOG_GUILDUPDATE_BOOSTMESSAGES'), affirmEmoji);
			}
			if (oldGuild.systemChannelFlags.bitfield === 2 && guild.systemChannelFlags.bitfield === 3) {
				await embed.addField(guild.language.get('GUILD_LOG_GUILDUPDATE_WELCOMEMESSAGES'), rejectEmoji);
			}
			if (oldGuild.systemChannelFlags.bitfield === 3 && guild.systemChannelFlags.bitfield === 0) {
				await embed.addField(guild.language.get('GUILD_LOG_GUILDUPDATE_WELCOMEMESSAGES'), affirmEmoji);
				await embed.addField(guild.language.get('GUILD_LOG_GUILDUPDATE_BOOSTMESSAGES'), affirmEmoji);
			}
			if (oldGuild.systemChannelFlags.bitfield === 3 && guild.systemChannelFlags.bitfield === 1) {
				await embed.addField(guild.language.get('GUILD_LOG_GUILDUPDATE_BOOSTMESSAGES'), affirmEmoji);
			}
			if (oldGuild.systemChannelFlags.bitfield === 3 && guild.systemChannelFlags.bitfield === 2) {
				await embed.addField(guild.language.get('GUILD_LOG_GUILDUPDATE_WELCOMEMESSAGES'), affirmEmoji);
			}
		}

		// Splash image changed
		if (oldGuild.splashURL !== guild.splashURL) {
			await embed.setTitle(guild.language.get('GUILD_LOG_GUILDUPDATE_SPLASH'));
			await embed.setImage(guild.splashURL);
		}

		// Banner image changed
		if (oldGuild.bannerURL !== guild.bannerURL) {
			await embed.setTitle(guild.language.get('GUILD_LOG_GUILDUPDATE_BANNER'));
			await embed.setImage(guild.bannerURL);
		}

		// Return null when premiumSubscriptionCount changes
		if (oldGuild.premiumSubscriptionCount !== guild.premiumSubscriptionCount) return;

		const logChannel = await this.client.channels.get(guild.settings.get('channels.log'));
		if (logChannel) await logChannel.send('', { disableEveryone: true, embed: embed });

		return;
	}

	async globalLog(oldGuild, guild) {
		const embed = new MessageEmbed()
			.setAuthor(`${guild.name} (${guild.id})`, guild.iconURL())
			.setColor(this.client.settings.get('colors.blue'))
			.setTimestamp();

		// Name changed
		if (oldGuild.name !== guild.name) {
			await embed.addField(guild.language.get('PREVNAME'), oldGuild);
			await embed.setFooter(guild.language.get('GLOBAL_LOG_GUILDUPDATE_NAME'));
		}

		// Icon changed
		if (oldGuild.iconURL() !== guild.iconURL()) {
			await embed.setFooter(guild.language.get('GLOBAL_LOG_GUILDUPDATE_ICON'));
		}

		if (oldGuild.name !== guild.name || oldGuild.iconURL() !== guild.iconURL()) {
			const globalLogChannel = await this.client.channels.get(this.client.settings.get('channels.globalLog'));
			if (globalLogChannel) await globalLogChannel.send('', { disableEveryone: true, embed: embed });

			return;
		}
	}

};
