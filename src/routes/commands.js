const { Route } = require('klasa-dashboard-hooks');

module.exports = class extends Route {

	constructor(...args) {
		super(...args, { route: 'commands' });
	}

	async get(request, response) {
		const { lang, category } = request.query;
		const language = lang && (this.client.languages.get(lang) || this.client.languages.default);
		const commands = (category ? this.client.commands.filter((cmd) => cmd.category === category) : this.client.commands).filter((cmd) => !cmd.fullCategory.includes('Pieces'));

		const serializedCommands = commands.map((cmd) => ({
			category: cmd.category,
			fullCategory: cmd.fullCategory,
			cooldown: cmd.cooldown,
			description: cmd.description(language),
			guarded: cmd.guarded,
			guildOnly: !cmd.runIn.includes('dm'),
			name: cmd.name,
			permissionLevel: cmd.permissionLevel,
			requiredPermissions: cmd.requiredPermissions.toArray(),
			usage: cmd.usageString
		}));

		return response.json(serializedCommands);
	}

};
