const { Finalizer } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Finalizer {

	constructor(...args) {
		super(...args, { enabled: true });
	}

	async run(msg, res, runTime) {
		if (this.client.configs.logs.commandRun) await this.commandRunLog(msg, runTime);

		return;
	}

	async commandRunLog(msg, runTime) {
		const embed = new MessageEmbed()
			.setAuthor(`${msg.author.tag} - (${msg.channel.guild.name})`, msg.channel.guild.iconURL())
			.setColor('#7289DA')
			.setTimestamp()
			.addField('Message:', msg.content)
			.addField('Runtime:', runTime)
			.setFooter(msg.guild.language.get('GLOBAL_LOG_COMMANDRUN', msg.channel));

		const globalLogChannel = await this.client.channels.get(this.client.configs.channels.globalLog);
		await globalLogChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

	async init() {
		await this.ensureGuildVars();
		return;
	}

	async ensureGuildVars() {
		if (!this.client.gateways.clientStorage.schema.has('logs')) await this.client.gateways.clientStorage.schema.add('logs');
		if (!this.client.gateways.clientStorage.schema.logs.has('commandRun')) await this.client.gateways.clientStorage.schema.logs.add('commandRun', { type: 'Boolean', array: false, default: true });

		return;
	}

};
