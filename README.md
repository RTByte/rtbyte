<div align="center">

![RTByte logo](https://rtbyte.xyz/android-chrome-192x192.png)

# RTByte

[![GitHub package.json version](https://img.shields.io/github/package-json/v/rtbyte/rtbyte)](https://github.com/RTByte/rtbyte/releases)
[![GitHub](https://img.shields.io/github/license/rtbyte/rtbyte)](https://github.com/rtbyte/rtbyte/blob/main/LICENSE.md)

[![Open Issues](https://img.shields.io/github/issues/RTByte/RTByte.svg)](https://github.com/RTByte/RTByte/issues)
[![Open PRS](https://img.shields.io/github/issues-pr/RTByte/RTByte.svg)](https://github.com/RTByte/RTByte/pulls)
[![Github All Contributors](https://img.shields.io/github/all-contributors/rtbyte/rtbyte)](https://github.com/RTByte/rtbyte#contributors-)
[![Crowdin](https://badges.crowdin.net/rtbyte/localized.svg)](https://translate.rtbyte.xyz)

[![Discord](https://img.shields.io/discord/450163430373064704.svg?colorB=7289da&label=discord&logo=Discord&logoColor=fff&style=flat)](https://rtbyte.xyz/discord)
[![Twitter](https://badgen.net/twitter/follow/rtbyte/?icon=twitter&label=@rtbyte)](https://twitter.com/rtbyte)
======
</div>

## Description

RTByte is an open-source modular multipurpose Discord bot built on the incredible [Sapphire] framework for [discord.js]. It brings a ton of features to help you run and manage your server. With an easy setup, you'll be up and running within minutes.

For more information about the project, and a link to add the bot to your server, please visit [rtbyte.xyz]. For support, please join our [Discord] server.

## Development

### Requirements

- [`Node.js`]: Node.js is required to run RTByte.
- [`PostgreSQL`]: Open-source relational database.
- [`Prisma`]: TypeScript ORM.

### Optionals

- [`Sentry`]: Error monitoring & tracking (not yet implemented in current version).
- [`Google Maps Platform`]: Geocoding API.
- [`OpenWeather`]: Weather API.

### A note regarding self-hosting RTByte

While RTByte is, and always will be, open-source, we're not very supportive of the idea of others self-hosting the bot. While you're completely free to host RTByte yourself, *you will not receive any support from us* in doing so.

Like many other open-source Discord bots, RTByte hasn't been built with the idea of self-hosting in mind. We use many different services to ensure we're able to deliver the best solution available.

- RTByte uses several external APIs. You'd need to create API keys in these for these to be able to fully use any features that may need them.
- RTByte uses [`PostgreSQL`], an open-source relational database, to store persistent data. [`Prisma`], a TypeScript ORM, is used to interface with said database.
- RTByte uses [`Sentry`] to track and monitor errors. Sentry is a paid service for which we've been granted an open-source license.

You can add RTByte to your server by visiting [rtbyte.xyz/invite].

## Contributors ✨

Thanks goes to these wonderful people:

<a href="https://github.com/RTByte/rtbyte/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=RTByte/rtbyte" />
</a>

<!------------------------ LINKS ------------------------>

[Sapphire]:         https://github.com/sapphire-project/framework
[discord.js]:                                 https://discord.com
[rtbyte.xyz]:                                  https://rtbyte.xyz
[Discord]:                             https://rtbyte.xyz/discord
[`Node.js`]:                                   https://nodejs.org
[`PostgreSQL`]:                        https://www.postgresql.org
[`Prisma`]:                                 https://www.prisma.io
[`Sentry`]:                                     https://sentry.io
[`Genius`]:                         https://genius.com/developers
[`Google Maps Platform`]: https://cloud.google.com/maps-platform/
[`OpenWeather`]:                       https://openweathermap.org
[`Twitch`]:                                 https://dev.twitch.tv
[rtbyte.xyz/invite]:                    https://rtbyte.xyz/invite
[emoji key]:        https://allcontributors.org/docs/en/emoji-key
