const moment = require('moment-timezone');

exports.embedSplitter = async function embedSplitter(name, valueArray, embed) {
	const bigString = valueArray.join(' ') + ' '; // eslint-disable-line prefer-template
	if (bigString.length < 1024) return embed.addField(name, bigString);

	const substrings = [];
	let splitLength = 0;

	while (splitLength < bigString.length) {
		let validString = bigString.slice(splitLength, splitLength + 1024);
		validString = validString.slice(0, validString.lastIndexOf(' ') + 1);

		if (!validString.length) {
			splitLength = bigString.length;
		} else {
			substrings.push(validString);
			splitLength += validString.length;
		}
	}

	await substrings.forEach(substring => {
		if (substring.length) embed.addField(name, substring);
	});

	return null;
};

exports.capitalize = (str) => {
	if (typeof str !== 'string') return '';
	return str.charAt(0).toUpperCase() + str.slice(1);
};

exports.momentThreshold = () => {
	moment.relativeTimeThreshold('s', 60);
	moment.relativeTimeThreshold('ss', 0);
	moment.relativeTimeThreshold('m', 60);
	moment.relativeTimeThreshold('h', 24);
	moment.relativeTimeThreshold('d', 31);
	moment.relativeTimeThreshold('M', 12);
};

exports.timezone = (prop, guild) => {
	const { capitalize } = require('./util');
	return capitalize(moment.tz(prop, guild.settings.get('timezone')).fromNow());
};
exports.timezoneWithDate = (prop, guild) => {
	const { capitalize } = require('./util');
	return `${capitalize(moment.tz(prop, guild.settings.get('timezone')).fromNow())} (${moment.tz(prop, guild.settings.get('timezone')).format('MMMM Do, YYYY')})`;
};

exports.truncate = (str) => {
	if (typeof str !== 'string') return '';
	if (str.length <= 1021) return str;

	return `${str.substr(0, str.lastIndexOf(' ', 1021))}...`;
};
