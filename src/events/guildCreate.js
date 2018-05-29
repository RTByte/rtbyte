const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, {
			enabled: true,
			once: false
		});
	}

	async run(guild) {
		if (!guild.available) return;
		if (this.client.configs.guildBlacklist.includes(guild.id)) {
			guild.leave();
			this.client.emit('warn', `Blacklisted guild detected: ${guild.name} [${guild.id}]`);
		}

		await guild.init();

		if (this.client.configs.logs.guildCreate) await this.guildCreateLog(guild);

		return;
	}

	async guildCreateLog(guild) {
		const embed = new MessageEmbed()
			.setAuthor(`${guild.name} - (${guild.id})`, guild.iconURL())
			.setColor(this.client.configs.colors.green)
			.setTimestamp()
			.setFooter(guild.language.get('GLOBAL_LOG_GUILDCREATE'));

		const globalLogChannel = await this.client.channels.get(this.client.configs.channels.globalLog);
		await globalLogChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

	async init() {
		await this.ensureGlobalVars();
		return;
	}

	async ensureGlobalVars() {
		if (!this.client.gateways.clientStorage.schema.has('logs')) await this.client.gateways.clientStorage.schema.add('logs');
		if (!this.client.gateways.clientStorage.schema.logs.has('guildCreate')) await this.client.gateways.clientStorage.schema.logs.add('guildCreate', { type: 'Boolean', array: false, default: true }); // eslint-disable-line
		return;
	}

};
