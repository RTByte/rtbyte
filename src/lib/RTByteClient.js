const { KlasaClient } = require('klasa');

KlasaClient.use(require('klasa-dashboard-hooks'));

const permissionLevels = require('./structures/schemas/permissionLevels');
const defaultGuildSchema = require('./structures/schemas/defaultGuildSchema');
const defaultClientSchema = require('./structures/schemas/defaultClientSchema');
const defaultUserSchema = require('./structures/schemas/defaultUserSchema');

class RTByteClient extends KlasaClient {

	constructor(options) {
		super({ ...options, permissionLevels, defaultGuildSchema, defaultClientSchema, defaultUserSchema });
	}

}

module.exports = RTByteClient;
