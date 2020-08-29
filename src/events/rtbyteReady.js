const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, {
			once: true,
			event: 'klasaReady'
		});
	}

	async run() {
		// Triggering initialization of the control guild if it hasn't been initialized
		if (this.client.options.controlGuild && !this.client.settings.get('guilds.controlGuild')) await this.setControlGuild();

		// Check to see that the bot is in at least one guild
		if (!this.client.guilds.cache.size) {
			await this.client.emit('error', 'Please add the bot to at least one guild.\nShutting down...');
			await this.client.destroy();
		}

		// Check to see that there is a control guild specified
		if (!this.client.settings.get('guilds.controlGuild')) {
			await this.client.emit('error', 'Please specify the control guild in your client configs and ensure the bot has been added to it with Administrator permissions.\nShutting down...');
			await this.client.destroy();
		}

		await this.client.emit('verbose', 'Verifying that all guilds are initialized...');

		await this.client.guilds.cache.forEach(async (guild) => {
			if (!guild.available) return;
			if (this.client.settings.get('guildBlacklist').includes(guild.id)) {
				guild.leave();
				this.client.emit('warn', `Blacklisted guild detected: ${guild.name} (${guild.id})`);
			} else {
				// eslint-disable-next-line max-len
				if ((!guild.settings.get('initialization.serverInitialized') || !guild.settings.get('channels.log')) && guild.id === this.client.settings.get('guilds.controlGuild')) await guild.rtbyteInit('control');
				if ((!guild.settings.get('initialization.serverInitialized') || !guild.settings.get('channels.log')) && guild.id !== this.client.settings.get('guilds.controlGuild')) await guild.rtbyteInit();
				await this.client.emit('verbose', `Verified initialization of guild: ${guild.name} (${guild.id})`);
			}
		});

		await this.client.emit('verbose', 'All guilds verified!');
		if (this.client.settings.get('logs.botReady')) await this.botReadyLog();

		return;
	}

	async botReadyLog() {
		const embed = new MessageEmbed()
			.setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
			.setColor(this.client.settings.get('colors.yellow'))
			.setTimestamp()
			.setFooter('Bot restarted');

		const globalLog = await this.client.channels.cache.get(this.client.settings.get('channels.globalLog'));
		if (globalLog) await globalLog.send('', { embed: embed });

		return;
	}

	async setControlGuild() {
		await this.client.emit('verbose', 'Setting control guild.');
		// Fail initialization if bot is not in the configured control guild
		if (!this.client.guilds.cache.has(this.client.options.controlGuild)) return;

		// Making sure we have a fully resolved guild object
		const controlGuild = await this.client.guilds.resolve(this.client.options.controlGuild);

		// Fail initialization if the control guild is not available for initialization
		if (!controlGuild.available) return;

		// Fail initialization if bot doesn't have administrator permissions in the control guild
		if (!controlGuild.me.permissions.has('ADMINISTRATOR')) return;

		// Registering control guild in clientStorage
		await this.client.settings.update('guilds.controlGuild', controlGuild.id);
		await this.client.settings.sync(true);

		return;
	}

};
