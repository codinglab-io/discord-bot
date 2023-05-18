<h1 align="center">Contributing our Discord bot</h1>

## Installation

We use [pnpm](https://pnpm.io) to manage our dependencies.  
You can [install it](https://pnpm.io/installation) using your preferred
method, but we recommend using [Corepack](https://nodejs.org/api/corepack.html#supported-package-managers) so that you
keep your package manager version in sync with ours.

Make sure you run **Node 20** or the dependencies' installation will fail.  
We recommend using [nvm](https://github.com/nvm-sh/nvm) to manage your Node version.

Finally, run `pnpm install`.

## Tooling

We use [Prettier](https://prettier.io/) and [ESLint](https://eslint.org/) to maintain
consistency in our code.  
You should set your editor up so that those tools are properly integrated.

Make sure to have [Docker](https://www.docker.com/) & [docker-compose](https://github.com/docker/compose) installed on
your machine as you
will need it to create your development environment.  
If needed, you can install it following [its documentation](https://docs.docker.com/get-docker/).

## Making Pull Requests

In order to contribute to the project, you will need to fork the repository first.  
Then, create a **Draft pull request** to let us known that you are working on it.  
Make sure your title follows the [conventional commits naming scheme](https://conventionalcommits.org/)
as it helps us to sort pull requests (you can view examples searching throughout our git history).  
When, you think that your work is ready, mark your PR as **Ready for review**.
