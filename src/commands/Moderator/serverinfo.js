const { Command, Timestamp } = require('klasa');
const { MessageEmbed } = require('discord.js');
const { embedSplitter } = require('../../lib/util/Util');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			requiredPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			aliases: ['sinfo', 'guildinfo'],
			permissionLevel: 5,
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
			russia: '🇷🇺 Russia'
		};
		this.verificationLevels = [
			'None',
			'Low',
			'Medium',
			'(╯°□°）╯︵ ┻━┻',
			'┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻'
		];
		this.filterLevels = [
			'Off',
			'On for unroled users',
			'On for everyone'
		];
	}

	async run(msg) {
		const roles = await msg.guild.roles.filter(role => role.name !== '@everyone').sort().array();
		const channels = await msg.guild.channels.filter(channel => channel.type !== 'category' && channel.type !== 'voice').array();
		const emojis = await msg.guild.emojis.array();

		const embed = new MessageEmbed()
			.setAuthor(msg.guild.name, msg.guild.iconURL())
			.setColor(this.client.settings.colors.white)
			.addField(msg.guild.language.get('COMMAND_SERVERINFO_ID'), msg.guild.id, true)
			.addField(msg.guild.language.get('COMMAND_SERVERINFO_NAME'), msg.guild.name, true)
			.addField(msg.guild.language.get('COMMAND_SERVERINFO_OWNER'), msg.guild.owner, true)
			.addField(msg.guild.language.get('COMMAND_SERVERINFO_MEMBERS'), msg.guild.memberCount, true)
			.addField(msg.guild.language.get('COMMAND_SERVERINFO_REGION'), this.regions[msg.guild.region], true)
			.addField(msg.guild.language.get('COMMAND_SERVERINFO_ROLES'), msg.guild.roles.size, true)
			.addField(msg.guild.language.get('COMMAND_SERVERINFO_CHANNELS'), msg.guild.channels.size, true)
			.addField(msg.guild.language.get('COMMAND_SERVERINFO_EMOJIS'), `${emojis.length}/100`, true)
			.addField(msg.guild.language.get('COMMAND_SERVERINFO_VLEVEL'), this.verificationLevels[msg.guild.verificationLevel], true)
			.addField(msg.guild.language.get('COMMAND_SERVERINFO_ECFILTER'), this.filterLevels[msg.guild.explicitContentFilter], true)
			.addField(msg.guild.language.get('COMMAND_SERVERINFO_CREATED'), this.timestamp.displayUTC(msg.guild.createdAt), true)
			.setThumbnail(msg.guild.iconURL(), 50, 50)
			.setImage(msg.guild.splashURL())
			.setTimestamp()
			.setFooter(msg.language.get('COMMAND_REQUESTED_BY', msg), msg.author.displayAvatarURL());

		if (!msg.guild.settings.logs.verboseLogging) return msg.channel.send('', { disableEveryone: true, embed: embed });

		await embedSplitter(msg.guild.language.get('COMMAND_SERVERINFO_ROLES'), roles, embed);
		await embedSplitter(msg.guild.language.get('COMMAND_SERVERINFO_CHANNELS'), channels, embed);
		await embedSplitter(msg.guild.language.get('COMMAND_SERVERINFO_EMOJIS'), emojis, embed);

		return msg.channel.send('', { disableEveryone: true, embed: embed });
	}

};
