<div align="center">

![RTByte logo](https://rtbyte.xyz/android-chrome-192x192.png)

# RTByte

[![GitHub package.json version](https://img.shields.io/github/package-json/v/rtbyte/rtbyte)](https://github.com/RTByte/rtbyte/releases)
[![GitHub](https://img.shields.io/github/license/rtbyte/rtbyte)](https://github.com/rtbyte/rtbyte/blob/main/LICENSE.md)
[![Total alerts](https://img.shields.io/lgtm/alerts/g/RTByte/RTByte.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/RTByte/RTByte/alerts)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/RTByte/RTByte.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/RTByte/RTByte/context:javascript)
[![David](https://img.shields.io/david/RTByte/RTByte.svg?maxAge=3600)](https://david-dm.org/RTByte/RTByte)

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

- [`Sentry`]: Error monitoring & tracking.
- [`Genius`]: Lyrics API.
- [`Google Maps Platform`]: Geocoding API.
- [`OpenWeather`]: Weather API.
- [`Twitch`]: Twitch API.

### A note regarding self-hosting RTByte

While RTByte is, and always will be, open-source, we're not very supportive of the idea of others self-hosting the bot. While you're completely free to host RTByte yourself, *you will not receive any support from us* in doing so.

Like many other open-source Discord bots, RTByte hasn't been built with the idea of self-hosting in mind. We use many different services to ensure we're able to deliver the best solution available.

- RTByte uses several external APIs. You'd need to create API keys in these for these to be able to fully use any features that may need them.
- RTByte uses [`PostgreSQL`], an open-source relational database, to store persistent data. [`Prisma`], a TypeScript ORM, is used to interface with said database.
- RTByte uses [`Sentry`] to track and monitor errors. Sentry is a paid service for which we've been granted an open-source license.

You can add RTByte to your server by visiting [rtbyte.xyz/invite].

## Contributors ✨

Thanks goes to these wonderful people ([emoji key]):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="http://rasmusgerdin.com/"><img src="https://avatars0.githubusercontent.com/u/11445945?v=4" width="100px;" alt=""/><br /><sub><b>Rasmus Gerdin</b></sub></a><br /><a href="https://github.com/RTByte/rtbyte/commits?author=rasmusgerdin" title="Code">💻</a> <a href="https://github.com/RTByte/rtbyte/commits?author=rasmusgerdin" title="Documentation">📖</a> <a href="#design-rasmusgerdin" title="Design">🎨</a> <a href="#ideas-rasmusgerdin" title="Ideas, Planning, & Feedback">🤔</a> <a href="#infra-rasmusgerdin" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#projectManagement-rasmusgerdin" title="Project Management">📆</a></td>
    <td align="center"><a href="https://michaelcumbers.ca/"><img src="https://avatars0.githubusercontent.com/u/16696023?v=4" width="100px;" alt=""/><br /><sub><b>Michael Cumbers</b></sub></a><br /><a href="https://github.com/RTByte/rtbyte/commits?author=mcumbers" title="Code">💻</a> <a href="https://github.com/RTByte/rtbyte/commits?author=mcumbers" title="Documentation">📖</a> <a href="#ideas-mcumbers" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/Uzui2012"><img src="https://avatars3.githubusercontent.com/u/22256520?v=4" width="100px;" alt=""/><br /><sub><b>Killian Higgins</b></sub></a><br /><a href="https://github.com/RTByte/rtbyte/commits?author=Uzui2012" title="Code">💻</a> <a href="#maintenance-Uzui2012" title="Maintenance">🚧</a> <a href="https://github.com/RTByte/rtbyte/pulls?q=is%3Apr+reviewed-by%3AUzui2012" title="Reviewed Pull Requests">👀</a></td>
    <td align="center"><a href="https://github.com/JShull97"><img src="https://avatars3.githubusercontent.com/u/38473222?v=4" width="100px;" alt=""/><br /><sub><b>JShull97</b></sub></a><br /><a href="https://github.com/RTByte/rtbyte/commits?author=JShull97" title="Code">💻</a></td>
    <td align="center"><a href="https://jankcat.com"><img src="https://avatars1.githubusercontent.com/u/7744158?v=4" width="100px;" alt=""/><br /><sub><b>Tim Watkins</b></sub></a><br /><a href="https://github.com/RTByte/rtbyte/commits?author=jankcat" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/ArtsyDiego"><img src="https://avatars2.githubusercontent.com/u/70177258?v=4" width="100px;" alt=""/><br /><sub><b>Artsy</b></sub></a><br /><a href="#design-ArtsyDiego" title="Design">🎨</a></td>
    <td align="center"><a href="https://github.com/PixelPoncho"><img src="https://avatars2.githubusercontent.com/u/33527005?v=4" width="100px;" alt=""/><br /><sub><b>Ines</b></sub></a><br /><a href="https://github.com/RTByte/rtbyte/commits?author=PixelPoncho" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://mchang.name"><img src="https://avatars0.githubusercontent.com/u/15132783?v=4" width="100px;" alt=""/><br /><sub><b>Michael M. Chang</b></sub></a><br /><a href="https://github.com/RTByte/rtbyte/commits?author=mchangrh" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

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
