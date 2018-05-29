const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, {
			enabled: true,
			once: false
		});
	}

	async run(old, msg) {
		if (this.client.ready && old.content !== msg.content) await this.client.monitors.run(msg);

		if (msg.guild && old.content !== msg.content) await this.editLog(old, msg);

		return;
	}

	async editLog(old, msg) {
		if (!msg.guild.configs.logs.messageUpdate) return;

		const embed = new MessageEmbed()
			.setAuthor(msg.channel.name, msg.guild.iconURL())
			.setColor(this.client.configs.colors.blurple)
			.setTitle(msg.guild.language.get('GUILD_LOG_MESSAGEUPDATE'))
			.addField(msg.guild.language.get('GUILD_LOG_BEFORE'), old.cleanContent)
			.addField(msg.guild.language.get('GUILD_LOG_AFTER'), msg.cleanContent)
			.setTimestamp()
			.setFooter(msg.author.tag, msg.author.avatarURL());

		const logChannel = await this.client.channels.get(msg.guild.configs.channels.serverLog);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

	async init() {
		await this.ensureGuildVars();
		return;
	}

	async ensureGuildVars() {
		if (!this.client.gateways.guilds.schema.has('logs')) await this.client.gateways.guilds.schema.add('logs');
		if (!this.client.gateways.guilds.schema.logs.has('messageUpdate')) await this.client.gateways.guilds.schema.logs.add('messageUpdate', { type: 'Boolean', array: false, default: false });
		return;
	}

};
