const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, {
			enabled: true,
			once: false
		});
	}

	async run(msg) {
		if (msg.command && msg.command.deletable) for (const message of msg.responses) message.delete();

		if (msg.guild) await this.deleteLog(msg);

		return;
	}

	async deleteLog(msg) {
		if (!msg.guild.configs.logs.messageUpdate) return;

		const embed = new MessageEmbed()
			.setAuthor(`#${msg.channel.name}`, msg.guild.iconURL())
			.setColor(this.client.configs.colors.blurple)
			.setTitle(msg.guild.language.get('GUILD_LOG_MESSAGEDELETE'))
			.addField(msg.guild.language.get('GUILD_LOG_MESSAGE'), msg.cleanContent)
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
		if (!this.client.gateways.guilds.schema.logs.has('messageDelete')) await this.client.gateways.guilds.schema.logs.add('messageDelete', { type: 'Boolean', array: false, default: false });
		return;
	}

};
