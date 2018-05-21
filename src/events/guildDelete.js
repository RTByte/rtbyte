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
		if (guild.available && !this.client.configs.preserveConfigs) guild.configs.destroy().catch(() => null);
		if (this.client.configs.logs.guildDelete) await this.guildDeleteLog(guild);

		return;
	}

	async guildDeleteLog(guild) {
		const embed = new MessageEmbed()
			.setAuthor(`${guild.name} - (${guild.id})`, guild.iconURL())
			.setColor('#ff9b9b')
			.setTimestamp()
			.setFooter(guild.language.get('GLOBAL_LOG_GUILDDELETE'));

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
		if (!this.client.gateways.clientStorage.schema.logs.has('guildDelete')) await this.client.gateways.clientStorage.schema.logs.add('guildDelete', { type: 'Boolean', array: false, default: true });
		return;
	}

};
