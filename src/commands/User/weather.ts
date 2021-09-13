import { LanguageKeys } from '#lib/i18n/languageKeys';
import { RTByteCommand, RTByteEmbed } from '#lib/structures';
import { API_KEYS } from '#root/config';
import { sendTemporaryMessage } from '#utils/functions';
import { urlEncodeString } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { reply } from '@sapphire/plugin-editable-commands';
import { Message, Permissions } from 'discord.js';

@ApplyOptions<RTByteCommand.Options>({
	aliases: ['climate'],
	description: LanguageKeys.Commands.User.WeatherDescription,
	requiredClientPermissions: [Permissions.FLAGS.EMBED_LINKS]
})
export class UserCommand extends RTByteCommand {
	public async run(message: Message, args: RTByteCommand.Args) {
		const guildSettings = await this.container.client.prisma.guild.findFirst({ where: { guildID: message.guild?.id } });

		const input = await args.repeatResult('string');

		if (!input.success) return sendTemporaryMessage(message, args.t(LanguageKeys.Commands.User.WeatherNoneSpecified));

		const encodedLocation = urlEncodeString(input.value.join(' '));

		// Geocode location using Mapbox
		const mapbox = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedLocation}.json?limit=1&fuzzyMatch=true&types=country,region,postcode,district,locality,neighborhood,address&access_token=${API_KEYS.MAPBOX}`;
		const { features } = await fetch<MapboxResultOk>(mapbox, FetchResultTypes.JSON);

		if (!features.length) return sendTemporaryMessage(message, args.t(LanguageKeys.Commands.User.WeatherInvalidInput, { input: input.value }));

		const units = message.guild ? guildSettings?.measurementUnits : 'metric';
		const lang = guildSettings?.language.slice(0, 2)
		const loc = features[0];
		const location = {
			long: loc.geometry.coordinates[0],
			lat: loc.geometry.coordinates[1],
			name: loc.text,
			country: loc.context ? loc.context.find(entry => entry.id.includes('country.'))?.short_code : loc.properties.short_code
		};

		const openweather = `https://api.openweathermap.org/data/2.5/onecall?lat=${location.lat}&lon=${location.long}&units=${units}&lang=${lang}&appid=${API_KEYS.OPENWEATHER}`;
		const { current } = await fetch<OpenweatherResultOk>(openweather, FetchResultTypes.JSON);

		if (!current.temp) return sendTemporaryMessage(message, args.t(LanguageKeys.Commands.User.WeatherInvalidInput, { input }));

		const weather = {
			temperature: current.temp,
			feelsLike: current.feels_like,
			humidity: `${current.humidity}%`,
			uvIndex: current.uvi,
			windSpeed: units === 'metric' ? `${current.wind_speed} m/s` : `${current.wind_speed} mph`,
			weather: current.weather[0].description.charAt(0).toUpperCase() + current.weather[0].description.slice(1)
		};

		const embed = new RTByteEmbed(message)
			.setAuthor(location.name, location.country ? `https://www.countryflags.io/${location.country}/flat/64.png` : undefined)
			.setDescription(args.t(LanguageKeys.Commands.User.WeatherEmbedDescription, { link: `https://www.google.com/maps/@${location.lat},${location.long},14z` }))
			.setThumbnail('')
			.addField(args.t(LanguageKeys.Commands.User.WeatherEmbedWeather), weather.weather)
			.addField(args.t(LanguageKeys.Commands.User.WeatherEmbedTemperatureTitle), args.t(LanguageKeys.Commands.User.WeatherEmbedTemperatureContent, { temp: Math.round(weather.temperature), unit: units === 'metric' ? 'C' : 'F', feelsLike: Math.round(weather.feelsLike) }))
			.addField(args.t(LanguageKeys.Commands.User.WeatherEmbedUVIndex), String(weather.uvIndex), true)
			.addField(args.t(LanguageKeys.Commands.User.WeatherEmbedWindSpeed), weather.windSpeed, true)
			.addField(args.t(LanguageKeys.Commands.User.WeatherEmbedHumidity), weather.humidity, true);

		return reply(message, { embeds: [embed] });
	}
}

export interface MapboxResultOk {
	type: string,
	features: [
		{
			properties: {
				short_code: string
			},
			text: string,
			geometry: {
				coordinates: string[]
			},
			context: [
				{
					id: string,
					short_code: string
				}
			]
		}
	],
	attribution: string
}

export interface OpenweatherResultOk {
	current: {
		temp: number,
		feels_like: number,
		humidity: number,
		uvi: number,
		wind_speed: number,
		weather: [
			{
				description: string
			}
		]
	}
}
