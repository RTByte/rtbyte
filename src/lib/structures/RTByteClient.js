const { KlasaClient } = require('klasa');

KlasaClient.use(require('klasa-member-gateway'));

const permissionLevels = require('./schemas/permissionLevels');
const defaultGuildSchema = require('./schemas/defaultGuildSchema');
const defaultClientSchema = require('./schemas/defaultClientSchema');
const defaultUserSchema = require('./schemas/defaultUserSchema');
const defaultMemberSchema = require('./schemas/defaultMemberSchema');

class RTByteClient extends KlasaClient {

	constructor(options) {
		super({ ...options, permissionLevels, defaultGuildSchema, defaultClientSchema, defaultUserSchema, defaultMemberSchema });
	}

}

module.exports = RTByteClient;
