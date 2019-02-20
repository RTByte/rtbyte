const { Command, Timestamp } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Get information on a mentioned user.',
			usage: '[Member:member]'
		});
		this.timestamp = new Timestamp('d MMMM YYYY, h:mm A');
	}

	async run(msg, [member = msg.member]) {
		const onlineEmoji = this.client.emojis.get(this.client.settings.emoji.online);
		const idleEmoji = this.client.emojis.get(this.client.settings.emoji.idle);
		const dndEmoji = this.client.emojis.get(this.client.settings.emoji.dnd);
		const offlineEmoji = this.client.emojis.get(this.client.settings.emoji.offline);
		const statuses = {
			online: `${onlineEmoji} Online`,
			idle: `${idleEmoji} Idle`,
			dnd: `${dndEmoji} Do Not Disturb`,
			offline: `${offlineEmoji} Offline`
		};

		const roleCollection = member.roles.reduce((userRoles, roles) => {
			if (!roles.name.includes('everyone')) {
				userRoles.push(roles);
			}
			return userRoles;
		}, []);

		const actualRoles = roleCollection.map(userRoles => `${userRoles}`).join(', ');
		console.log(actualRoles);

		const embed = new MessageEmbed()
			.setColor(this.client.settings.colors.white)
			.addField(msg.guild.language.get('COMMAND_USERINFO_NAME'), member.user.tag, true)
			.addField(msg.guild.language.get('COMMAND_USERINFO_ID'), member.id, true)
			.addField(msg.guild.language.get('COMMAND_USERINFO_JOINED'), this.timestamp.display(member.user.createdAt), true)
			.addField(msg.guild.language.get('COMMAND_USERINFO_REGISTERED'), this.timestamp.display(member.joinedTimestamp), true)
			.addField(msg.guild.language.get('COMMAND_USERINFO_STATUS'), statuses[member.user.presence.status], true)
			.setThumbnail(member.user.displayAvatarURL())
			.setTimestamp()
			.setFooter(`Requested by ${msg.author.tag}`, msg.author.displayAvatarURL());

		if (member.user.presence.activity) {
			embed.addField(msg.guild.language.get('COMMAND_USERINFO_ACTIVITY', member), member.user.presence.activity ? member.user.presence.activity.name : 'N/A', true)
		}
		if (actualRoles) {
			embed.addField(msg.guild.language.get('COMMAND_USERINFO_ROLES'), actualRoles);
		}

		await msg.send('', { disableEveryone: true, embed: embed });
		return;
	}

};