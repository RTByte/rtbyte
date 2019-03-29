const { KlasaClient } = require('klasa');

module.exports = KlasaClient.defaultMemberSchema
	.add('moderaton', folder => folder
		.add('cases', 'String', { array: true }));
