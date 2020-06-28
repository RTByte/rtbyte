const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const { embedSplitter, momentThreshold, timezoneWithDate } = require('../../lib/util/Util');
const moment = require('moment-timezone');

momentThreshold(moment);

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			requiredPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			aliases: ['sinfo', 'guildinfo'],
			permissionLevel: 6,
			description: language => language.get('COMMAND_SERVERINFO_DESCRIPTION'),
			extendedHelp: ''
		});
	}

	async run(msg) {
		const roles = await msg.guild.roles.cache.filter(role => role.name !== '@everyone').sort().array();
		const textVoiceChannels = await msg.guild.channels.cache.filter(channel => channel.type === 'text' || channel.type === 'news' || channel.type === 'voice').array();
		const textChannels = await msg.guild.channels.cache.filter(channel => channel.type === 'text' || channel.type === 'news').array();
		const voiceChannels = await msg.guild.channels.cache.filter(channel => channel.type === 'voice').array();
		const emojis = await msg.guild.emojis.cache.array();
		let prunable;
		await msg.guild.members.prune({ days: 30, dry: true }).then(pruned => {
			prunable = pruned;
		});

		const embed = new MessageEmbed()
			.setAuthor(msg.guild.name, msg.guild.iconURL())
			.setColor(this.client.settings.get('colors.white'))
			.addField(msg.guild.language.get('NAME'), msg.guild.name, true)
			.addField(msg.guild.language.get('ID'), msg.guild.id, true)
			.addField(msg.guild.language.get('OWNER'), msg.guild.owner, true)
			.addField(msg.guild.language.get('COMMAND_SERVERINFO_REGION'), msg.language.get('REGION', msg.guild.region), true)
			.addField(msg.guild.language.get('MEMBERS'), msg.guild.language.get('COMMAND_SERVERINFO_MEMBERCOUNT', msg.guild.memberCount, msg.guild.members.cache.filter(mbr => mbr.user.bot).size), true)
			.addField(msg.guild.language.get('COMMAND_SERVERINFO_PRUNABLE'), prunable, true)
			.addField(msg.guild.language.get('ROLES'), roles.length, true)
			.addField(msg.guild.language.get('CHANNELS'), msg.guild.language.get('COMMAND_SERVERINFO_CHANNELDETAILS', textVoiceChannels.length, textChannels.length, voiceChannels.length), true)
			.addField(msg.guild.language.get('EMOJIS'), msg.guild.emojis.cache.size, true)
			.addField(msg.guild.language.get('COMMAND_SERVERINFO_VLEVEL'), msg.guild.language.get('COMMAND_SERVERINFO_VLEVEL_LEVELS', msg.guild.verificationLevel), true)
			.addField(msg.guild.language.get('COMMAND_SERVERINFO_ECFILTER'), msg.guild.language.get('COMMAND_SERVERINFO_ECFILTER_LEVELS', msg.guild.explicitContentFilter), true)
			// eslint-disable-next-line max-len
			.addField(msg.guild.language.get('CREATED'), timezoneWithDate(msg.guild.createdTimestamp, msg.guild))
			.setThumbnail(msg.guild.iconURL(), 50, 50)
			.setImage(msg.guild.splashURL())
			.setTimestamp()
			.setFooter(msg.language.get('COMMAND_REQUESTED_BY', msg), msg.author.displayAvatarURL());

		if (msg.guild.premiumTier > 0) {
			embed.addField(msg.guild.language.get('COMMAND_SERVERINFO_NITROTIER'), msg.guild.language.get('COMMAND_SERVERINFO_NITROTIER_LEVELS', msg.guild.premiumTier), true);
		}

		if (msg.guild.premiumSubscriptionCount > 0) {
			embed.addField(msg.guild.language.get('COMMAND_SERVERINFO_NITROAMOUNT'), msg.guild.premiumSubscriptionCount, true);
		}

		if (!msg.guild.settings.get('commands.serverinfoExtendedOutput')) return msg.channel.send('', { disableEveryone: true, embed: embed });

		if (roles.length) await embedSplitter(msg.guild.language.get('ROLES'), roles, embed);
		if (textChannels.length) await embedSplitter(msg.guild.language.get('COMMAND_SERVERINFO_TEXTCHANNELS'), textChannels, embed);
		if (emojis.length) await embedSplitter(msg.guild.language.get('EMOJIS'), emojis, embed);

		return msg.channel.send('', { disableEveryone: true, embed: embed });
	}

};
