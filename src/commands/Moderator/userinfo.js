const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const { embedSplitter } = require('../../lib/util/Util');
const moment = require('moment-timezone');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['uinfo'],
			permissionLevel: 6,
			requiredPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			runIn: ['text'],
			description: language => language.get('COMMAND_USERINFO_DESCRIPTION'),
			usage: '[member:membername]'
		});
	}

	async run(msg, [membername = msg.member]) {
		const onlineEmoji = this.client.emojis.cache.get(this.client.settings.emoji.online);
		const idleEmoji = this.client.emojis.cache.get(this.client.settings.emoji.idle);
		const dndEmoji = this.client.emojis.cache.get(this.client.settings.emoji.dnd);
		const offlineEmoji = this.client.emojis.cache.get(this.client.settings.emoji.offline);
		const statuses = {
			online: `${onlineEmoji} ${msg.guild.language.get('ONLINE')}`,
			idle: `${idleEmoji} ${msg.guild.language.get('IDLE')}`,
			dnd: `${dndEmoji} ${msg.guild.language.get('DND')}`,
			offline: `${offlineEmoji} ${msg.guild.language.get('OFFLINE')}`
		};

		const roles = await membername.roles.cache.filter(role => role.name !== '@everyone').sort().array();

		const joinPosition = await msg.guild.members.cache.array().sort((first, last) => first.joinedAt - last.joinedAt);

		const position = joinPosition.indexOf(membername) + 1;

		const embed = new MessageEmbed()
			.setColor(!membername.premiumSince ? this.client.settings.colors.white : this.client.settings.colors.pink)
			.addField(msg.guild.language.get('NAME'), `${membername} (${membername.user.tag})`, true)
			.addField(msg.guild.language.get('ID'), membername.id, true)
			.addField(msg.language.get('JOIN_POS'), position)
			.addField(msg.guild.language.get('JOINED'), moment.tz(membername.joinedTimestamp, msg.guild.settings.timezone).format('Do MMMM YYYY, h:mmA zz'))
			.addField(msg.guild.language.get('REGISTERED'), moment.tz(membername.user.createdTimestamp, msg.guild.settings.timezone).format('Do MMMM YYYY, h:mmA zz'))
			.addField(msg.guild.language.get('COMMAND_USERINFO_STATUS'), statuses[membername.user.presence.status], true)
			.setThumbnail(membername.user.displayAvatarURL())
			.setTimestamp()
			.setFooter(msg.language.get('COMMAND_REQUESTED_BY', msg), msg.author.displayAvatarURL());

		if (membername.user.presence.activity) {
			// eslint-disable-next-line max-len
			await embed.addField(msg.guild.language.get('COMMAND_USERINFO_ACTIVITY', membername), membername.user.presence.activity.type === 'CUSTOM_STATUS' ? `${`${membername.user.presence.activity.emoji} ` || ''}${membername.user.presence.activity.state}` || 'N/A' : membername.user.presence.activity ? !membername.user.presence.activity.details ? membername.user.presence.activity.name : membername.user.presence.activity.type === 'LISTENING' ? `${membername.user.presence.activity.name}\n\`${membername.user.presence.activity.details} by ${membername.user.presence.activity.state}\`` : `${membername.user.presence.activity.name}\n\`${membername.user.presence.activity.details}\`` : 'N/A', true);
		}

		if (membername.premiumSinceTimestamp) {
			await embed.addField(msg.guild.language.get('COMMAND_USERINFO_NITROBOOST'), moment.tz(membername.premiumSinceTimestamp, msg.guild.settings.timezone).format('Do MMMM YYYY, h:mmA zz'));
		}

		if (roles.length) await embedSplitter(msg.guild.language.get('ROLES'), roles, embed);

		await msg.send('', { disableEveryone: true, embed: embed });
		return;
	}

};
