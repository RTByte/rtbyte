const { Event } = require('klasa');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, {
			enabled: true,
			once: false
		});
	}

	async run() {
		// Triggering initialization of Control Guild if it hasn't been initialized
		if (this.client.options.controlGuild && !this.client.configs.guilds.controlGuild) await this.setControlGuild();

		// Check to see that the bot is in at least one Guild
		if (!this.client.guilds.size) {
			await this.client.emit('error', 'Please add the Bot to at least one Guild.\nShutting Down...');
			await this.client.destroy();
		}

		// Check to see that there is a Control Guild specified
		if (!this.client.configs.guilds.controlGuild) {
			await this.client.emit('error', 'Please specify the Control Guild in your Client Configs and ensure the Bot has been added to that Guild with Administrator permissions\nShutting Down...');
			await this.client.destroy();
		}

		await this.client.emit('verbose', 'Verifying all Guilds are initialized...');

		await this.client.guilds.forEach(async (guild) => {
			if (!guild.available) return;
			if (!guild.configs.roles.administrator && guild.id === this.client.configs.guilds.controlGuild) await guild.init('control');
			if (!guild.configs.roles.administrator && guild.id !== this.client.configs.guilds.controlGuild) await guild.init();
			await this.client.emit('verbose', `Verified initialization of Guild: ${guild.name} (${guild.id})`);
		});

		await this.client.emit('verbose', 'All Guilds Verified!');
		return;
	}

	async init() {
		await this.ensureGlobalVars();
		await this.ensureGuildVars();
		return;
	}

	async ensureGlobalVars() {
		await this.client.emit('verbose', 'Ensuring Global Variables are Created');
		if (!this.client.gateways.clientStorage.schema.has('guilds')) await this.client.gateways.clientStorage.schema.add('guilds');
		if (!this.client.gateways.clientStorage.schema.guilds.has('controlGuild')) await this.client.gateways.clientStorage.schema.guilds.add('controlGuild', { type: 'Guild', array: false });
		if (!this.client.gateways.clientStorage.schema.has('channels')) await this.client.gateways.clientStorage.schema.add('channels');
		if (!this.client.gateways.clientStorage.schema.channels.has('globalLog')) await this.client.gateways.clientStorage.schema.channels.add('globalLog', { type: 'TextChannel', array: false });
		if (!this.client.gateways.clientStorage.schema.has('emoji')) await this.client.gateways.clientStorage.schema.add('emoji');
		if (!this.client.gateways.clientStorage.schema.emoji.has('affirm')) await this.client.gateways.clientStorage.schema.emoji.add('affirm', { type: 'String', array: false });
		if (!this.client.gateways.clientStorage.schema.emoji.has('reject')) await this.client.gateways.clientStorage.schema.emoji.add('reject', { type: 'String', array: false });
		return;
	}

	async ensureGuildVars() {
		await this.client.emit('verbose', 'Ensuring Guild Variables are Created.');
		if (!this.client.gateways.guilds.schema.has('roles')) await this.client.gateways.guilds.schema.add('roles');
		if (!this.client.gateways.guilds.schema.roles.has('administrator')) await this.client.gateways.guilds.schema.roles.add('administrator', { type: 'Role', array: false });
		if (!this.client.gateways.guilds.schema.roles.has('moderator')) await this.client.gateways.guilds.schema.roles.add('moderator', { type: 'Role', array: false });
		if (!this.client.gateways.guilds.schema.has('channels')) await this.client.gateways.guilds.schema.add('channels');
		if (!this.client.gateways.guilds.schema.channels.has('serverLog')) await this.client.gateways.guilds.schema.channels.add('serverLog', { type: 'TextChannel', array: false });
		return;
	}

	async setControlGuild() {
		await this.client.emit('verbose', 'Setting Control Guild');
		// Fail initialization if bot is not in Control Guild
		if (!this.client.guilds.has(this.client.options.controlGuild)) return;

		// Making sure to have fully resolved guild object
		const controlGuild = await this.client.guilds.resolve(this.client.options.controlGuild);

		// Fail initialization if Control Guild is not available for initialization
		if (!controlGuild.available) return;

		// Fail initialization if Bot doesn't have Administrator permissions in Control Guild
		if (!controlGuild.me.permissions.has('ADMINISTRATOR')) return;

		// Registering Control Guild in clientStorage
		await this.client.configs.update({ guilds: { controlGuild: controlGuild.id } });
		await this.client.configs.sync(true);
		return;
	}

};
