const { Command, Timestamp } = require('klasa');
const { MessageEmbed } = require('discord.js');

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
		this.timestamp = new Timestamp('d MMMM YYYY, h:mm A');
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
	}

	async run(msg) {
		const embed = new MessageEmbed()
			.setAuthor(msg.guild.name, msg.guild.iconURL())
			.setColor(this.client.settings.colors.white)
			.addField(msg.guild.language.get('COMMAND_SERVERINFO_ID'), msg.guild.id, true)
			.addField(msg.guild.language.get('COMMAND_SERVERINFO_NAME'), msg.guild.name, true)
			.addField(msg.guild.language.get('COMMAND_SERVERINFO_OWNER'), msg.guild.owner, true)
			.addField(msg.guild.language.get('COMMAND_SERVERINFO_MEMBERS'), msg.guild.memberCount, true)
			.addField(msg.guild.language.get('COMMAND_SERVERINFO_CHANNELS'), msg.guild.channels.size, true)
			.addField(msg.guild.language.get('COMMAND_SERVERINFO_EMOJIS'), `${msg.guild.emojis.size}/50`, true)
			.addField(msg.guild.language.get('COMMAND_SERVERINFO_ROLES'), msg.guild.roles.size, true)
			.addField(msg.guild.language.get('COMMAND_SERVERINFO_REGION'), this.regions[msg.guild.region], true)
			.addField(msg.guild.language.get('COMMAND_SERVERINFO_CREATED'), this.timestamp.display(msg.guild.createdAt), true)
			.setThumbnail(msg.guild.iconURL(), 50, 50)
			.setImage(msg.guild.splashURL())
			.setTimestamp()
			.setFooter(`Requested by ${msg.author.tag}`, msg.author.displayAvatarURL());
		return msg.channel.send('', { disableEveryone: true, embed: embed });
	}

};