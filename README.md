<h1 align="center">Discord bot</h1>

<p align="center">
Discord bot used in <a href="https://discord.gg/7Guzz9e">Codinglab server</a>.
</p>

<br/>

## Current Features

- [Create audio channels on demand by joining a Lobby.](./src/modules/voiceOnDemand)
- [Ping to test availability with `/fart`.](./src/modules/fart)
- [Reply with "feur" when a sentence ends by "quoi"](./src/modules/quoiFeur/).
- [Replace a message containing a pattern by another one.](./src/modules/recurringMessage/)
- [Add voting reactions and summarize every message in a channel.](./src/modules/coolLinksManagement/)
- [Can send a message for the interval of your choice. (eg: every day)](./src/modules/recurringMessage/)

## Core concept

The bot is using a modular approach, each feature is created in it's own dedicated folder inside [modules](./src/modules/).

To create a new feature, create a new folder, call `createModule()` and fill in your slashCommands, event-handlers, environments and storage, the [core](./src/core/) handles the rest.

Altough the bot is really dedicated to the codinglab community, it's possible to run it for you with minimum configuration, and remove/add modules at will. It's also possible to invite it to multiple discord servers.

## Contributing

To contribute or self-host the bot, see our [contributing guide](./CONTRIBUTING.md).
