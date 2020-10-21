const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');
const { apis } = require('../../config');
const { Colors } = require('../../lib/util/constants');

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

				fetch(`https://api.darksky.net/forecast/${apis.darksky}/${longLat}?units=si`)
					.then(res => res.json())
					.then(wjson => {
						const condition = wjson.currently.summary;
						const minutely = wjson.minutely ? wjson.minutely.summary : null;
						const hourly = wjson.hourly ? wjson.hourly.summary : null;
						const daily = wjson.daily ? wjson.daily.summary : null;
						const chanceOfRain = Math.round((wjson.currently.precipProbability * 100) / 5) * 5;
						const tempCelsius = Math.round(wjson.currently.temperature);
						const tempFahrenheit = Math.round((tempCelsius * 9 / 5) + 32);
						const windSpeedMs = Math.round(wjson.currently.windSpeed);
						const windSpeedMph = Math.round(windSpeedMs * 2.237);
						const humidity = Math.round(wjson.currently.humidity * 100);

						let temp, wind;
						if (msg.guild) {
							if (msg.guild.settings.get('measurementUnits') === 'metric') {
								temp = `${tempCelsius}° C (${tempFahrenheit}° F)`;
								wind = `${windSpeedMs} m/s (${windSpeedMph} mph)`;
							}
							if (msg.guild.settings.get('measurementUnits') === 'imperial') {
								temp = `${tempFahrenheit}° F (${tempCelsius}° C)`;
								wind = `${windSpeedMph} mph (${windSpeedMs} m/s)`;
							}
						} else {
							temp = `${tempCelsius}° C (${tempFahrenheit}° F)`;
							wind = `${windSpeedMs} m/s (${windSpeedMph} mph)`;
						}

						const embed = new MessageEmbed()
							.setAuthor(geocodeLocation, countryCode ? `https://www.countryflags.io/${countryCode}/flat/64.png` : null)
							.setColor(Colors.white)
							.setDescription(msg.language.get('COMMAND_WEATHER_LINK', mapsLink, darkskyLink))
							.addField(msg.language.get('COMMAND_WEATHER_CONDITION'), condition, true)
							.addField(msg.language.get('COMMAND_WEATHER_TEMPERATURE'), temp, true)
							.addField(msg.language.get('COMMAND_WEATHER_DAILY'), minutely || hourly || daily)
							.addField(msg.language.get('COMMAND_WEATHER_WINDSPEED'), wind, true)
							.addField(msg.language.get('COMMAND_WEATHER_CHANCEOFRAIN'), `${chanceOfRain}%`, true)
							.addField(msg.language.get('COMMAND_WEATHER_HUMIDITY'), `${humidity}%`, true)
							.setTimestamp()
							.setFooter(msg.language.get('COMMAND_REQUESTED_BY', msg), msg.author.displayAvatarURL());
						return msg.send('', { embed: embed });
					});

				return true;
			});
	}

};
