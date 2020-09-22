# Molgenis Theme

This is the base SCSS theme for Molgenis. All Molgenis themes
inherit from this theme. Checkout **theme/default**
for an example. The base theme also provides a Dockerized
Nginx proxy that makes it easier to develop styling against
remote Molgenis sites and localized Molgenis stacks.

## Prerequisites

For the Proxy & Molgenis services:

* [Docker](https://docs.docker.com/docker-for-mac/install/)
* [Docker-compose](https://docs.docker.com/compose/install/)

For theme development:

* [Node.js](https://nodejs.org/dist/v14.9.0/node-v14.9.0.pkg)
* [Yarn](https://classic.yarnpkg.com/en/docs/install/#mac-stable)
* [Visual Studio Code](https://code.visualstudio.com/docs/setup/mac)

## Basic Usage

```bash
git clone git@github.com:molgenis/molgenis-theme.git
cd molgenis-theme
yarn
# Set the default config file
cp .env.defaults .env
# Build the selected theme (MG_THEME in .env)
yarn build
```

Congratulations! You just generated the default Molgenis theme.

> The CSS files were written to the **css** directory

Build all themes at once, in case the theme directory contains more than one theme:

```bash
yarn build-all
```

> All themes have their CSS files written to the **css** directory

## Configuration

The configuration for Docker and the SCSS tool are read from a shared
environment file; the **.env** file.
It recognizes the following options:

```bash
# No need to change; used to make docker containers unique per project
COMPOSE_PROJECT_NAME=mg_projects
```

```bash
# Determines which services to start; e.g. only the Nginx proxy
COMPOSE_FILE=dc-proxy.yml
# Nginx proxy + molgenis services; use this you need to test changes
# in Molgenis itself from IntelliJ
COMPOSE_FILE=dc-proxy.yml:dc-mg-services.yml
# The whole Molgenis stack; useful to test a deployment locally
COMPOSE_FILE=dc-proxy.yml:dc-mg-services.yml:dc-mg.yml
```

```bash
# URL of running Molgenis instance; use an external Molgenis
# URL when only using the Nginx proxy.
MG_HOST=https://master.dev.molgenis.org
# Using the whole Molgenis stack, you need to use the
# Docker service name here if you want to proxy the
# local instance.
MG_HOST=http://molgenis:8080
```

```bash
# Which theme to watch and/or build from the /projects dir
MG_THEME=default

# The proxied Molgenis CSS file to watch for changes
MG_WATCH=bootstrap-molgenis-blue.min.css
```

## Development

### Starting A New Theme

* Just copy an existing theme to a new directory:

  ```bash
  cp -R theme/default theme/molgenis-red
  ```

* Update the config to use the new theme

  ```bash
  # vim docker/.env
  MG_THEME=molgenis-red
  ```

* Build the theme

  ```bash
  yarn build
  ```

### Working with the proxy

In this example we use a remote Molgenis host, instead of the local Molgenis setup.

* Setup the proxy config in the **.env** file:

  ```bash
  # The proxied host
  MG_HOST=https://master.dev.molgenis.org
  # The theme that is being applied on the proxied host.
  MG_THEME=molgenis-red
  # The current theme that is being used on the proxy - in this example - master.dev.molgenis.org
  # Check view-source:https://master.dev.molgenis.org/ for the current theme in the <head> section
  MG_WATCH=bootstrap-molgenis-blue.min.css
  ```

* Start the Nginx proxy and the dev tool

```bash
docker-compose up
# From another terminal tab
yarn dev
```

* Visit http://localhost; you should see the proxied version of https://master.molgenis.org
  using the *molgenis-red* theme

* Install the Chrome [livereload extension](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei)
  to autoreload on file-change

* Switch livereload on; try changing **$mg-color-primary** in **molgenis-red/_variables.scss**

  > The theme on the webpage should automatically update on save.

## Structure & Conventions

Both Bootstrap 3 & 4 CSS is being used in Molgenis, while it transitions to Bootstrap 4.
Make sure you check the current Molgenis page source to verify that the asserted theme
is being used. The setup of the themes is such, that the theme in **scss/molgenis** should
provide sane defaults for *all* themes, and that all themes inherit their main
settings from this base set of SCSS files. To keep everything maintainable,
it is __essential__ that each theme has a minimal amount of custom styling.
So, when trying to fit in a new theme, please try to maintain the following workflow order:

1. Change Molgenis variables in the myproject theme
2. Update Bootstrap variables in scss/molgenis
3. Refactor Molgenis variables in scss/molgenis if necessary
4. Add selectors in scss/molgenis (_custom) using Molgenis variables
5. Add Bootstrap variables to custom theme (theme-3.scss/theme-4.scss)
6. Add selectors to custom theme (theme-3.scss/theme-4.scss)

<details>
<summary><em>Common SCSS locations & their meaning</em></summary>

```markdown
* **theme-3.scss** is the root source-file for the generated Molgenis Bootstrap 3 theme
* **theme-4.scss** is the root source-file for the generated Molgenis Bootstrap 4 theme
* Theme variables go in **./theme/myproject/_variables.scss**
* Theme-agnostic fixes should be made in the main theme at **./scss/molgenis**
* Molgenis theme variables start with the **mg-** prefix
* Molgenis theme variables are in **./scss/molgenis/_variables.scss**
* Do not use Bootstrap variables in themes directly if you don't need to;
* use the **mg-** prefixed Molgenis theme variables instead
* Bootstrap-3 variables are in **./node_modules/bootstrap-sass/assets/stylesheets/bootstrap/_variables.scss**
* Bootstrap-4 variables are in **./node_modules/bootstrap-scss/_variables.scss**
* Bootstrap-3 variables are customized in **./scss/molgenis/theme-3/_variables.scss**
* Bootstrap-4 variables are customized in **./scss/molgenis/theme-4/_variables.scss**
* Small theme-agnostic Bootstrap-agnostic selectors are in **scss/molgenis/_custom.scss**
* Extensive theme-agnostic Bootstrap-agnostic selectors are in **scss/molgenis/elements/_some-page-element.scss**
* Small theme-agnostic Bootstrap-3 specific selectors are in **scss/molgenis/theme-3/_custom.scss**
* Extensive theme-agnostic Bootstrap-3 specific selectors are in **scss/molgenis/theme-3/elements/_some-page-element.scss**
* Theme-agnostic Bootstrap-4 specific selectors are in **scss/molgenis/theme-4/_custom.scss**
* Extensive theme-agnostic Bootstrap-4 specific selectors are in **scss/molgenis/theme-4/elements/_some-page-element.scss**
```

</details>

## Serving Themes

This is a Proof-of-Concept theme service, that generates theme files on-the-fly.
Instead of requesting CSS files, a Molgenis instance may just post a set of
variables to this service. The accompanying theme is then returned accordingly.
Usage:

* Start the SCSS service

  ```bash
  yarn serve
  ```

* Post a request body to http://localhost:8080/theme with a tool like Postman

  ```json
  {
    "name": "molgenis-red",
    "version": 4,
    "mg-color-primary": "#005c8f",
    "mg-color-primary-light": "#0069a4"
  }
  ```

> Depending on the version (3 or 4), either the generated Bootstrap 3 or Bootstrap 4
  version is returned. Post validation is still a bit flunky, so its easy to break.