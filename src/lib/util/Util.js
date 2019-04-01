module.exports = class Util {

	async embedSplitter(name, valueArray, embed) {
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
	}

};
