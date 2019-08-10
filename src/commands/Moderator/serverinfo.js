const { Command, Timestamp } = require('klasa');
const { MessageEmbed } = require('discord.js');
const { embedSplitter } = require('../../lib/util/Util');

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
		this.timestamp = new Timestamp('d MMMM YYYY');
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
			russia: '🇷🇺 Russia',
			india: '🇮🇳 India'
		};
	}

	async run(msg) {
		const roles = await msg.guild.roles.filter(role => role.name !== '@everyone').sort().array();
		const channels = await msg.guild.channels.filter(channel => channel.type !== 'category' && channel.type !== 'voice').array();
		const emojis = await msg.guild.emojis.array();

		const embed = new MessageEmbed()
			.setAuthor(msg.guild.name, msg.guild.iconURL())
			.setColor(this.client.settings.colors.white)
			.addField(msg.guild.language.get('ID'), msg.guild.id, true)
			.addField(msg.guild.language.get('NAME'), msg.guild.name, true)
			.addField(msg.guild.language.get('OWNER'), msg.guild.owner, true)
			.addField(msg.guild.language.get('COMMAND_SERVERINFO_REGION'), this.regions[msg.guild.region], true)
			.addField(msg.guild.language.get('MEMBERS'), msg.guild.memberCount, true)
			.addField(msg.guild.language.get('ROLES'), msg.guild.roles.size, true)
			.addField(msg.guild.language.get('CHANNELS'), msg.guild.channels.size, true)
			.addField(msg.guild.language.get('EMOJIS'), msg.guild.emojis.size, true)
			.addField(msg.guild.language.get('COMMAND_SERVERINFO_VLEVEL'), msg.guild.language.get('COMMAND_SERVERINFO_VLEVEL_LEVELS', msg.guild), true)
			.addField(msg.guild.language.get('COMMAND_SERVERINFO_ECFILTER'), msg.guild.language.get('COMMAND_SERVERINFO_ECFILTER_LEVELS', msg.guild), true)
			.addField(msg.guild.language.get('COMMAND_SERVERINFO_CREATED'), `${this.timestamp.displayUTC(msg.guild.createdAt)} (UTC)`, true)
			.setThumbnail(msg.guild.iconURL(), 50, 50)
			.setImage(msg.guild.splashURL())
			.setTimestamp()
			.setFooter(msg.language.get('COMMAND_REQUESTED_BY', msg), msg.author.displayAvatarURL());

		if (msg.guild.premiumTier > 0) {
			embed.addField(msg.guild.language.get('COMMAND_SERVERINFO_NITROTIER'), msg.guild.language.get('COMMAND_SERVERINFO_NITROTIER_LEVELS', msg.guild), true);
		}

		if (msg.guild.premiumSubscriptionCount > 0) {
			embed.addField(msg.guild.language.get('COMMAND_SERVERINFO_NITROAMOUNT'), msg.guild.premiumSubscriptionCount, true);
		}

		if (!msg.guild.settings.logs.verboseLogging) return msg.channel.send('', { disableEveryone: true, embed: embed });

		if (roles.length) await embedSplitter(msg.guild.language.get('ROLES'), roles, embed);
		if (channels.length) await embedSplitter(msg.guild.language.get('CHANNELS'), channels, embed);
		if (emojis.length) await embedSplitter(msg.guild.language.get('EMOJIS'), emojis, embed);

		return msg.channel.send('', { disableEveryone: true, embed: embed });
	}

};
