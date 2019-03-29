const { KlasaClient } = require('klasa');

module.exports = KlasaClient.defaultMemberSchema
	.add('moderation', folder => folder
		.add('cases', 'String', { array: true }));
