import { FT, T } from '#lib/types';

export const ChoiceDescription = T<string>('commands/user:choice.description');
export const ChoiceTooFew = T<string>('commands/user:choice.responses.tooFew');
export const CoinflipDescription = T<string>('commands/user:coinflip.description');
export const CoinflipHeads = T<string>('commands/user:coinflip.responses.heads');
export const CoinflipTails = T<string>('commands/user:coinflip.responses.tails');
export const EightballDescription = T<string>('commands/user:8ball.description');
export const EightballNoQuestion = T<string>('commands/user:8ball.responses.noQuestion');
export const EightballAnswers = T<readonly string[]>('commands/user:8ball.responses.answers');
export const EnlargeDescription = T<string>('commands/user:enlarge.description');
export const EnlargeNoneSpecified = T<string>('commands/user:enlarge.responses.noneSpecified');
export const EnlargeInvalidInput = FT<{ input: string }>('commands/user:enlarge.responses.invalidInput');
export const InfoDescription = T<string>('commands/user:info.description');
export const InfoEmbedTitle = T<string>('commands/user:info.embed.title');
export const InfoEmbedDescription = T<string>('commands/user:info.embed.description');
export const InfoEmbedTeamTitle = T<string>('commands/user:info.embed.fields.team.title');
export const InfoEmbedTeamContent = T<string>('commands/user:info.embed.fields.team.content');
export const InfoEmbedVersion = T<string>('commands/user:info.embed.fields.version');
export const InfoEmbedLinksTitle = T<string>('commands/user:info.embed.fields.links.title');
export const InfoEmbedLinksContent = T<string>('commands/user:info.embed.fields.links.content');
export const InviteDescription = T<string>('commands/user:invite.description');
export const InviteEmbedTitle = T<string>('commands/user:invite.embed.title');
export const InviteEmbedDescription = T<string>('commands/user:invite.embed.description');
export const JoindateDescription = T<string>('commands/user:joindate.description');
export const JoindateEmbedJoinPosition = T<string>('commands/user:joindate.embed.fields.joinPosition.title');
export const JoindateEmbedJoinPositionNumber = FT<{ position: number }, string>('commands/user:joindate.embed.fields.joinPosition.content')
export const JoindateEmbedJoined = FT<{ joinedTimestampOffset: number, joinedAt: string }, string>('commands/user:joindate.embed.fields.joined');
export const JoindateEmbedCreated = FT<{ createdTimestampOffset: number, createdAt: string }, string>('commands/user:joindate.embed.fields.created');
export const JoindateUserNotMember = FT<{ input: string }>('commands/user:joindate.responses.notMember');
export const PingDescription = T<string>('commands/user:ping.description');
export const Ping = T<string>('commands/user:ping.responses.ping');
export const PingPong = FT<{ diff: number; ping: number }, string>('commands/user:ping.responses.pong');
export const QuoteDescription = T<string>('commands/user:quote.description');
export const QuoteEmbedFooter = FT<{ channel: string }, string>('commands/user:quote.embed.footer');
export const WeatherDescription = T<string>('commands/user:weather.description');
export const WeatherEmbedDescription = FT<{ link: string }, string>('commands/user:weather.embed.description');
export const WeatherEmbedLocalTime = T<string>('commands/user:weather.embed.fields.localTime');
export const WeatherEmbedWeather = T<string>('commands/user:weather.embed.fields.weather');
export const WeatherEmbedTemperatureTitle = T<string>('commands/user:weather.embed.fields.temperature.title');
export const WeatherEmbedTemperatureContent = FT<{ temp: number, unit: string, feelsLike: number }, string>('commands/user:weather.embed.fields.temperature.content');
export const WeatherEmbedUVIndex = T<string>('commands/user:weather.embed.fields.uvIndex');
export const WeatherEmbedWindTitle = T<string>('commands/user:weather.embed.fields.wind.title');
export const WeatherEmbedWindContent = FT<{ windSpeed: number, direction: string}, string>('commands/user:weather.embed.fields.wind.content');
export const WeatherEmbedHumidity = T<string>('commands/user:weather.embed.fields.humidity');
export const WeatherNoneSpecified = T<string>('commands/user:weather.responses.noneSpecified');
export const WeatherInvalidInput = FT<{ input: string }>('commands/user:weather.responses.invalidInput');
