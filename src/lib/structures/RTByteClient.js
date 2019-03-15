const { KlasaClient } = require('klasa');

const permissionLevels = require('./schemas/permissionLevels');
const defaultGuildSchema = require('./schemas/defaultGuildSchema');
const defaultClientSchema = require('./schemas/defaultClientSchema');

class RTByteClient extends KlasaClient {

	constructor(options) {
		super({ ...options, permissionLevels, defaultGuildSchema, defaultClientSchema });
	}

}

module.exports = RTByteClient;
