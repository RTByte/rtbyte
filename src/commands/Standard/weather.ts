import { RTByteCommand } from "#lib/extensions/RTByteCommand";
import { RTByteEmbed } from "#lib/extensions/RTByteEmbed";
import { API_KEYS } from "#root/config";
import { ApplyOptions } from "@sapphire/decorators";
import { FetchResultTypes, fetch } from '@sapphire/fetch';
import type { ChatInputCommand } from "@sapphire/framework";
import { codeBlock, inlineCodeBlock } from "@sapphire/utilities";

@ApplyOptions<ChatInputCommand.Options>({
	description: 'Fetch the current weather for a specified location'
})
export class UserCommand extends RTByteCommand {
	public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
		registry.registerChatInputCommand((builder) => 
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addStringOption((option) =>
					option
						.setName('location')
						.setDescription('The location to fetch the current weather for')
						.setRequired(true)
				)
				.addStringOption((option) =>
					option
						.setName('units')
						.setDescription('Specify if the result should use Celsius & the Metric System or Fahrenheit & the Imperial System')
						.setRequired(false)
						.addChoices(
							{ name: 'celsius & metric', value: 'metric' },
							{ name: 'fahrenheit & imperial', value: 'imperial' }
						)
				), {
					idHints: [
						// Dev bot command
						'1122151286683476068'
					]
				}
		);
	}

	public async chatInputRun(interaction: ChatInputCommand.Interaction) {
		const locationInput = interaction.options.getString('location') as string;

    	await interaction.deferReply({ ephemeral: false, fetchReply: true });

		const encodedLocation = encodeURI(locationInput);
		const units = interaction.options.getString('units') || 'metric'
		const speedUnits = ['m/s', 'mph'];
		const directions = ['north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest'];

		// Geocode location using Google Maps, then sort into object
		const googleMaps = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedLocation}&key=${API_KEYS.GOOGLE_MAPS}`;
		const { results } = await fetch<GoogleMapsResultOk>(googleMaps, FetchResultTypes.JSON);
		// Inform user if specified location cannot be resolved
		if (!results.length) return interaction.editReply(`${inlineCodeBlock(locationInput)} could not be resolved to a location.`);
		const location = {
			lat: results[0].geometry.location.lat,
			lon: results[0].geometry.location.lng,
			name: results[0].formatted_address,
			country: results[0].address_components.find(entry => entry.types.includes('country'))?.short_name,
			mapsLink: `https://www.google.com/maps/@${results[0].geometry.location.lat},${results[0].geometry.location.lng},13z`
		}

		// Fetch weather for geocoded location using OpenWeather, then sort into object
		const openWeather = `https://api.openweathermap.org/data/2.5/onecall?lat=${location.lat}&lon=${location.lon}&units=${units}&appid=${API_KEYS.OPENWEATHER}`;
		const { timezone, current, alerts } = await fetch<OpenWeatherResultOk>(openWeather, FetchResultTypes.JSON);
		if (!current.temp) return interaction.editReply(`Unable to fetch the weather for ${inlineCodeBlock(location.name)} (input was ${inlineCodeBlock(locationInput)}).`);
		const weather = {
			localTime: new Date(current.dt * 1000).toLocaleString(interaction.locale, { timeZone: timezone, hour: 'numeric', minute: 'numeric' }),
			temperature: Math.round(current.temp),
			feelsLike: Math.round(current.feels_like),
			humidity: `${current.humidity}%`,
			uvIndex: current.uvi,
			windDirection: directions[Math.round(((current.wind_deg %= 360 ) < 0 ? current.wind_deg + 360 : current.wind_deg) / 45) % 8],
			windSpeed: `${current.wind_speed} ${units === 'imperial' ? speedUnits[1] : speedUnits[0]}`,
			weather: current.weather[0].description.charAt(0).toUpperCase() + current.weather[0].description.slice(1),
			icon: current.weather[0].icon
		}

		// Build embed from all collected data
		const embed = new RTByteEmbed()
			.setAuthor({
				name: location.name,
				url: location.mapsLink,
				iconURL: location.country ? `https://flagcdn.com/w40/${location.country.toLowerCase()}.png` : undefined
			})
			.setThumbnail(`http://openweathermap.org/img/wn/${weather.icon}@4x.png`)
			.addFields(
				{ name: 'Local time', value: inlineCodeBlock(weather.localTime), inline: true },
				{ name: 'Weather', value: weather.weather, inline: true },
				{ name: 'Temperature', value: `${weather.temperature}° ${units === 'imperial' ? 'F' : 'C'} (feels like ${weather.feelsLike}°)`, inline: true },
				{ name: 'UV index', value: inlineCodeBlock(`${weather.uvIndex}`), inline: true },
				{ name: 'Wind', value: `${weather.windSpeed} ${weather.windDirection}`, inline: true },
				{ name: 'Humidity', value: inlineCodeBlock(weather.humidity), inline: true }
			);

			if (alerts) {
				const alert = {
					sender: alerts[0].sender_name,
					event: alerts[0].event.charAt(0).toLocaleUpperCase() + alerts[0].event.slice(1),
					start: new Date(alerts[0].start * 1000).toLocaleString(interaction.locale, { timeZone: timezone }),
					end: new Date(alerts[0].end * 1000).toLocaleString(interaction.locale, { timeZone: timezone }),
					desciption: alerts[0].description
				};
	
				embed.addBlankField();
				if (alert.event) embed.addFields({ name: '⚠️ Weather alert', value: alert.event});
				if (alert.sender) embed.addFields({ name: 'Sender', value: alert.sender });
				if (alert.desciption) embed.addFields({ name: 'Description', value: codeBlock('', alert.desciption) });
				if (alert.start) embed.addFields({ name: 'From', value: inlineCodeBlock(alert.start), inline: true });
				if (alert.end) embed.addFields({ name: 'Until', value: inlineCodeBlock(alert.end), inline: true });
			}

		return interaction.editReply({ content: '', embeds: [embed] });
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

export interface OpenWeatherResultOk {
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
