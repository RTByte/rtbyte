import { Args, Command, CommandOptions } from '@sapphire/framework';
import { Message } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import fetch from 'node-fetch';
import { urlEncodeString } from '@util/util';
import { API_KEYS } from '@root/config';
import { FirestoreCollections } from '@lib/types/Types';
import { InfoEmbed } from '@lib/structures/InfoEmbed';
import { DateTime } from 'luxon';

@ApplyOptions<CommandOptions>({
	aliases: ['climate'],
	description: 'commands/user:weather.description'
})
export class RTByteCommand extends Command {

	public async run(msg: Message, args: Args) {
		const input = await args.repeatResult('string');

		if (!input.success) return console.log('no');

		const encodedLocation = urlEncodeString(input.value.join(' '));

		const mapbox = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedLocation}.json?limit=1&fuzzyMatch=true&types=country,region,postcode,district,locality,neighborhood,address&access_token=${API_KEYS.MAPBOX}`).then(data => data.json());

		if (mapbox.features.length === 0) return console.log(`can't find a location for ${mapbox.query[0]}`);

		const units = msg.guild ? await this.client.firestore.get(FirestoreCollections.Guilds, msg.guild!.id).then(data => data.units) : 'metric';
		const loc = mapbox.features[0];
		const location = {
			'long': loc.geometry.coordinates[0],
			'lat': loc.geometry.coordinates[1],
			'name': loc.text,
			'country': loc.context ? loc.context.find((entry: {id: string}) => entry.id.includes('country.')).short_code : loc.properties.short_code
		};

		const openweather = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${location.lat}&lon=${location.long}&units=${units}&appid=${API_KEYS.OPENWEATHER}`).then(data => data.json());

		if (!openweather) return console.log('no weather');

		const weather = {
			localTime: DateTime.fromSeconds(openweather.current.dt, { zone: openweather.timezone }).toLocaleString(DateTime.TIME_SIMPLE),
			temperature: openweather.current.temp,
			feelsLike: openweather.current.feels_like,
			humidity: openweather.current.humidity,
			windSpeed: openweather.current.wind_speed,
			weather: <string> openweather.current.weather[0].description.charAt(0).toUpperCase() + <string> openweather.current.weather[0].description.slice(1)
		};

		const embed = await new InfoEmbed(msg)
			.boilerplate(msg);

		embed.setAuthor(location.name, location.country ? `https://www.countryflags.io/${location.country}/flat/64.png` : undefined)
			 .setDescription(await msg.fetchLanguageKey('commands/user:weather.embed.description', { mapLink: `https://www.google.com/maps/@${location.lat},${location.long},14z` }))
			 .addField(await msg.fetchLanguageKey('commands/user:weather.embed.fields.localTime'), weather.localTime, true)
			 .addField(await msg.fetchLanguageKey('commands/user:weather.embed.fields.weather'), weather.weather, true)
			 .addField(await msg.fetchLanguageKey('commands/user:weather.embed.fields.temperature.title'), await msg.fetchLanguageKey('commands/user:weather.embed.fields.temperature.content', { temp: Math.round(weather.temperature), feelsLike: Math.round(weather.feelsLike), unit: units === 'metric' ? 'C' : 'F' }))
			 .addField(await msg.fetchLanguageKey('commands/user:weather.embed.fields.windSpeed'), units === 'metric' ? `${weather.windSpeed} m/s` : `${weather.windSpeed} mph`, true)
			 .addField(await msg.fetchLanguageKey('commands/user:weather.embed.fields.humidity'), `${weather.humidity}%`, true);

		return msg.channel.send(embed);
	}

}
