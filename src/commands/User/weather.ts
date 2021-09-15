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
		const units = message.guild ? guildSettings?.measurementUnits : 'metric';
		const lang = guildSettings?.language.slice(0, 2)

		// Geocode location using Google Maps
		const googleMaps = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedLocation}&key=${API_KEYS.GOOGLE_MAPS}`
		const { results } = await fetch<GoogleMapsResultOk>(googleMaps, FetchResultTypes.JSON);

		if (!results.length) return sendTemporaryMessage(message, args.t(LanguageKeys.Commands.User.WeatherInvalidInput, { input: input.value }));

		const loc = results[0];

		const location = {
			lat: loc.geometry.location.lat,
			long: loc.geometry.location.lng,
			name: loc.formatted_address,
			country: loc.address_components.find(entry => entry.types.includes('country'))?.short_name
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

export interface GoogleMapsResultOk {
	results: [
		{
			address_components: [
				{
					long_name: string,
					short_name: string,
					types: string[]
				}
			]
			formatted_address: string,
			geometry: {
				location: {
					lat: number,
					lng: number
				}
			}
		}
	]
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
