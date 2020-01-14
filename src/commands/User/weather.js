const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');
const { apis } = require('../../config');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['climate'],
			description: language => language.get('COMMAND_WEATHER_DESCRIPTION'),
			runIn: ['text', 'dm'],
			usage: '<location:str>'
		});
		this.customizeResponse('location', message =>
			message.language.get('COMMAND_WEATHER_NOPARAM'));
	}

	async run(msg, [location]) {
		const locationURI = encodeURIComponent(location.replace(/ /g, '+'));

		await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${locationURI}&key=${apis.google}`)
			.then(res => res.json())
			.then(json => {
				if (!json.results.length) return msg.reply(msg.language.get('COMMAND_WEATHER_NOTFOUND'));

				const result = json.results[0];

				const geocodeLocation = result.formatted_address;
				const longLat = `${result.geometry.location.lat},${result.geometry.location.lng}`;
				const locality = result.address_components.find(loc => loc.types.includes('locality'));
				const governing = result.address_components.find(gov => gov.types.includes('administrative_area_level_1'));
				const country = result.address_components.find(cou => cou.types.includes('country'));
				const countryCode = country ? country.short_name.toLowerCase() : null;
				const continent = result.address_components.find(con => con.types.includes('continent'));
				const city = locality || governing || country || continent || {};
				const mapsLink = `https://www.google.com/maps/place/${city.long_name.replace(' ', '+')}/@${longLat}/`;
				const darkskyLink = `https://darksky.net/forecast/${longLat}/`;

				fetch(`https://api.darksky.net/forecast/${apis.darksky}/${longLat}?exclude=minutely,hourly,flags&units=auto`)
					.then(res => res.json())
					.then(wjson => {
						const condition = wjson.currently.summary;
						const minutely = wjson.minutely ? wjson.minutely.summary : null;
						const daily = wjson.daily ? wjson.daily.summary : null;
						const chanceOfRain = Math.round((wjson.currently.precipProbability * 100) / 5) * 5;
						const temperature = Math.round(wjson.currently.temperature);
						const windSpeed = Math.round(wjson.currently.windSpeed);
						const humidity = Math.round(wjson.currently.humidity * 100);


						const embed = new MessageEmbed()
							.setAuthor(geocodeLocation, countryCode ? `https://www.countryflags.io/${countryCode}/flat/64.png` : null)
							.setColor(this.client.settings.colors.white)
							.setDescription(msg.language.get('COMMAND_WEATHER_LINK', mapsLink, darkskyLink))
							.addField(msg.language.get('COMMAND_WEATHER_CONDITION'), condition, true)
							// eslint-disable-next-line no-mixed-operators
							.addField(msg.language.get('COMMAND_WEATHER_TEMPERATURE'), `${temperature}° C (${temperature * 9 / 5 + 32}° F)`, true)
							.addField(msg.language.get('COMMAND_WEATHER_DAILY'), minutely || daily)
							.addField(msg.language.get('COMMAND_WEATHER_WINDSPEED'), `${windSpeed} m/s (${Math.round(windSpeed * 3600 / 1610.3 * 1000) / 1000} mph)`, true)
							.addField(msg.language.get('COMMAND_WEATHER_CHANCEOFRAIN'), `${chanceOfRain}%`, true)
							.addField(msg.language.get('COMMAND_WEATHER_HUMIDITY'), `${humidity}%`, true)
							.setTimestamp()
							.setFooter(msg.language.get('COMMAND_REQUESTED_BY', msg), msg.author.displayAvatarURL());
						return msg.send('', { disableEveryone: true, embed: embed });
					});

				return true;
			});
	}

};
