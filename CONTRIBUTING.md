<h1 align="center">Contributing our Discord bot</h1>

## Installation

We use [pnpm](https://pnpm.io) to manage our dependencies.  
You can [install it](https://pnpm.io/installation) using your preferred
method, but we recommend using [Corepack](https://nodejs.org/api/corepack.html#supported-package-managers) so that you keep your package manager version in sync with ours.

Make sure you run **Node 20** or the dependencies' installation will fail.  
We recommend using [nvm](https://github.com/nvm-sh/nvm) to manage your Node version.

Finally, run `pnpm install`.

## Running

### Minimal setup

Copy [`.env.example`](./.env.example) to `.env` and fill you discord token.

If you don't have a token, create a discord application on [their developer portal](https://discord.com/developers/applications). Make sure to get your bot token and paste it in the .env file.

If you're part of Codinglab, we do have a test discord server ready for you, contact Moderators on discord to gain access. After that you shoud be ready to go, and start the bot with `pnpm dev`.

### Persistence

By default, the bot stores it's data in-memory.
Altough this is great for fast setup and quick bootstraping of features, you most likely want to run a persistent storage on your machine.

To enable persistence, set `REDIS_URL` env var to `"redis://localhost:6379"` and start the local redis server with `docker-compose up`. (see [Tooling](#tooling) to setup docker)

### Custom test discord server

If you aren't part of Codinglab [(?)](https://prout.dev), you can create a test discord-server similar to Codinglab's by using [our template](https://discord.new/E2RjGshcThgx).

Get your invitation link from the [the developer portal](https://discord.com/developers/applications) in `Your App > OAuth2 > URL Generator`, and invite the bot in your discord-server.

## Tooling

We use [Prettier](https://prettier.io/) and [ESLint](https://eslint.org/) to maintain
consistency in our code.  
You should set your editor up so that those tools are properly integrated. Our integration pipeline will run pnpm scripts to lint, format, typecheck, and test in order to merge.

[OPTIONNAL]: To enable persistance, install [Docker](https://www.docker.com/) & [docker-compose](https://github.com/docker/compose) installed on your machine as you will need it to create your development environment.
If needed, you can install it following [its documentation](https://docs.docker.com/get-docker/).

## Making Pull Requests

In order to contribute to the project, you will need to fork the repository first.  
Then, create a **Draft pull request** to let us known that you are working on it.  
Make sure your title follows the [conventional commits naming scheme](https://conventionalcommits.org/)
as it helps us to sort pull requests (you can view examples searching throughout our git history).  
When, you think that your work is ready, mark your PR as **Ready for review**.
