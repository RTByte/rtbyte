import { LanguageKeys } from '#lib/i18n/languageKeys';
import { RTByteCommand, RTByteEmbed } from '#lib/structures';
import { API_KEYS } from '#root/config';
import { sendTemporaryMessage } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { reply } from '@sapphire/plugin-editable-commands';
import { codeBlock, inlineCodeBlock } from '@sapphire/utilities';
import { Message, Permissions } from 'discord.js';

@ApplyOptions<RTByteCommand.Options>({
	aliases: ['climate'],
	description: LanguageKeys.Commands.User.WeatherDescription,
	requiredClientPermissions: [Permissions.FLAGS.EMBED_LINKS]
})
export class UserCommand extends RTByteCommand {
	public async messageRun(message: Message, args: RTByteCommand.Args) {
		const guildSettings = await this.container.client.prisma.guildSettings.findFirst({ where: { guildID: message.guild?.id } });

		const input = await args.repeatResult('string');

		if (!input.success) return sendTemporaryMessage(message, args.t(LanguageKeys.Commands.User.WeatherNoneSpecified));

		const encodedLocation = encodeURI(input.value.join(' '));
		const units = message.guild ? guildSettings?.measurementUnits : 'metric';
		const speedUnits = await args.t(LanguageKeys.Miscellaneous.SpeedUnits) as readonly string[];
		const directions = await args.t(LanguageKeys.Miscellaneous.Directions) as readonly string[];
		const lang = guildSettings?.language.slice(0, 2)

		// Geocode location using Google Maps
		const googleMaps = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedLocation}&language=${lang}&key=${API_KEYS.GOOGLE_MAPS}`;
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
		const { timezone, current, alerts } = await fetch<OpenweatherResultOk>(openweather, FetchResultTypes.JSON);

		if (!current.temp) return sendTemporaryMessage(message, args.t(LanguageKeys.Commands.User.WeatherInvalidInput, { input }));

		const weather = {
			localTime: new Date(current.dt * 1000).toLocaleString(guildSettings?.language, { timeZone: timezone, hour: 'numeric', minute: 'numeric' }),
			temperature: current.temp,
			feelsLike: current.feels_like,
			humidity: `${current.humidity}%`,
			uvIndex: current.uvi,
			windDirection: directions[Math.round(((current.wind_deg %= 360) < 0 ? current.wind_deg + 360 : current.wind_deg) / 45) % 8],
			windSpeed: units === 'metric' ? `${current.wind_speed} ${speedUnits[0]}` : `${current.wind_speed} ${speedUnits[1]}`,
			weather: current.weather[0].description.charAt(0).toUpperCase() + current.weather[0].description.slice(1),
			icon: current.weather[0].icon
		};

		const embed = new RTByteEmbed(message, args.t)
			.setAuthor(location.name, location.country ? `https://flagcdn.com/w40/${location.country.toLowerCase()}.png` : undefined)
			.setDescription(args.t(LanguageKeys.Commands.User.WeatherEmbedDescription, { link: `https://www.google.com/maps/@${location.lat},${location.long},14z` }))
			.setThumbnail(`http://openweathermap.org/img/wn/${weather.icon}@4x.png`)
			.addField(args.t(LanguageKeys.Commands.User.WeatherEmbedLocalTime), weather.localTime, true)
			.addField(args.t(LanguageKeys.Commands.User.WeatherEmbedWeather), weather.weather, true)
			.addField(args.t(LanguageKeys.Commands.User.WeatherEmbedTemperatureTitle), args.t(LanguageKeys.Commands.User.WeatherEmbedTemperatureContent, { temp: Math.round(weather.temperature), unit: units === 'metric' ? 'C' : 'F', feelsLike: Math.round(weather.feelsLike) }), true)
			.addField(args.t(LanguageKeys.Commands.User.WeatherEmbedUVIndex), String(weather.uvIndex), true)
			.addField(args.t(LanguageKeys.Commands.User.WeatherEmbedWindTitle), args.t(LanguageKeys.Commands.User.WeatherEmbedWindContent, { windSpeed: weather.windSpeed, direction: weather.windDirection}), true)
			.addField(args.t(LanguageKeys.Commands.User.WeatherEmbedHumidity), weather.humidity, true);

		if (alerts) {
			const alert = {
				sender: alerts[0].sender_name,
				event: alerts[0].event.charAt(0).toLocaleUpperCase() + alerts[0].event.slice(1),
				start: new Date(alerts[0].start * 1000).toLocaleString(guildSettings?.language, { timeZone: timezone }),
				end: new Date(alerts[0].end * 1000).toLocaleString(guildSettings?.language, { timeZone: timezone }),
				desciption: alerts[0].description
			};

			embed.addBlankField();
			if (alert.event) embed.addField(args.t(LanguageKeys.Commands.User.WeatherEmbedAlert), alert.event);
			if (alert.sender) embed.addField(args.t(LanguageKeys.Commands.User.WeatherEmbedAlertSender), alert.sender);
			if (alert.desciption) embed.addField(args.t(LanguageKeys.Miscellaneous.Description), codeBlock('', alert.desciption));
			if (alert.start) embed.addField(args.t(LanguageKeys.Miscellaneous.From), inlineCodeBlock(alert.start), true);
			if (alert.end) embed.addField(args.t(LanguageKeys.Miscellaneous.Until), inlineCodeBlock(alert.end), true);
		}

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
	timezone: string,
	current: {
		dt: number
		temp: number,
		feels_like: number,
		humidity: number,
		uvi: number,
		wind_speed: number,
		wind_deg: number
		weather: [
			{
				description: string,
				icon: string
			}
		]
	},
	alerts: [
		{
			sender_name: string,
			event: string,
			start: number,
			end: number,
			description: string,
			tags: string[]
		}
	]
}
