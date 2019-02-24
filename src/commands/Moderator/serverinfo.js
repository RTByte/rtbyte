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
		const roleCollection = msg.guild.roles.reduce((serverRoles, roles) => {
			if (!roles.name.includes('everyone')) {
				serverRoles.push(roles);
			}
			return serverRoles;
		}, []);

		const actualRoles = roleCollection.map(serverRoles => `${serverRoles}`).join(', ');

		const emojis = msg.guild.emojis.map(emojis => emojis.toString()).join(' ')

		const embed = new MessageEmbed()
			.setAuthor(msg.guild.name, msg.guild.iconURL())
			.setColor(this.client.settings.colors.white)
			.addField(msg.guild.language.get('COMMAND_SERVERINFO_ID'), msg.guild.id, true)
			.addField(msg.guild.language.get('COMMAND_SERVERINFO_NAME'), msg.guild.name, true)
			.addField(msg.guild.language.get('COMMAND_SERVERINFO_OWNER'), msg.guild.owner, true)
			.addField(msg.guild.language.get('COMMAND_SERVERINFO_MEMBERS'), msg.guild.memberCount, true)
			.addField(msg.guild.language.get('COMMAND_SERVERINFO_REGION'), this.regions[msg.guild.region], true)
			.addField(msg.guild.language.get('COMMAND_SERVERINFO_VLEVEL'), this.verificationLevels[msg.guild.verificationLevel], true)
			.addField(msg.guild.language.get('COMMAND_SERVERINFO_ECFILTER'), this.filterLevels[msg.guild.explicitContentFilter], true)
			.addField(msg.guild.language.get('COMMAND_SERVERINFO_CREATED'), this.timestamp.display(msg.guild.createdAt), true)
			.addField(msg.guild.language.get('COMMAND_SERVERINFO_CHANNELS'), msg.guild.channels.map(channels => channels.toString()).join(', '), true)
			.setThumbnail(msg.guild.iconURL(), 50, 50)
			.setImage(msg.guild.splashURL())
			.setTimestamp()
			.setFooter(`Requested by ${msg.author.tag}`, msg.author.displayAvatarURL());

		if (actualRoles) {
			await embed.addField(msg.guild.language.get('COMMAND_SERVERINFO_ROLES'), actualRoles, true);
		}
		if (emojis) {
			embed.addField(msg.guild.language.get('COMMAND_SERVERINFO_EMOJIS'), emojis, true);
		}
		return msg.channel.send('', { disableEveryone: true, embed: embed });
	}

};