# Molgenis Theme

This is the base SCSS theme for Molgenis. All Molgenis themes
inherit from this theme. Checkout **theme/molgenis-blue**
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
# Build the selected theme (MG_THEME_LOCAL in .env)
yarn build
# Build all themes at once
yarn build-all
```

Congratulations! You just generated the default molgenis-blue theme.

> CSS files were written to the **css** directory.

## Configuration

The configuration for Docker and the SCSS tool are read from a shared
environment file; the **.env** file.
It has the following options:

```bash
# No need to change; used to make docker containers unique per project
COMPOSE_PROJECT_NAME=mg_projects
# URL of the Molgenis instance to proxy.
MG_PROXY=https://master.dev.molgenis.org
# In combination running the whole Molgenis stack, you need to use
# the Docker service name here, i.e.
# MG_PROXY=http://molgenis:8080

# Which theme to use from the theme dir:
MG_THEME_LOCAL=molgenis-blue
# Theme name the proxy is using:
MG_THEME_PROXY=bootstrap-molgenis-blue.min.css
```

## Development

### Starting A New Theme

* Just copy an existing theme to a new directory:

  ```bash
  cp -R theme/molgenis-blue theme/molgenis-red
  ```

* Update the config to use the new theme

  ```bash
  # vim docker/.env
  MG_THEME_LOCAL=molgenis-red
  ```

* Build the theme

  ```bash
  yarn build
  ```

### Using The Proxy

The Nginx proxy setup is meant to apply locally developed theming files
to a remotely controlled Molgenis site, to make your live as a developer
a bit easier. The development service features auto-build of SCSS source-files
and livereload of stylesheets, so changes to your theme are automatically
reflected in the browser. It requires a bit of setup though:

* Setup the proxy config in the **.env** file:

  ```bash
  # Example with yarn proxy
  MG_PROXY=https://master.dev.molgenis.org
  # Example with yarn proxy-services; use docker host ip here:
  # MG_PROXY=http://172.19.0.1:8080
  # Example with yarn proxy-molgenis; use docker service name here:
  # MG_PROXY=http://molgenis:8080

  # The theme that is being applied on the proxied host.
  MG_THEME_LOCAL=molgenis-red
  # The theme that is in use by the proxy
  # Check view-source:https://master.dev.molgenis.org/ for
  # the current theme in the <head> section
  MG_THEME_PROXY=bootstrap-molgenis-blue.min.css
  ```

Start the proxy in one of the three different setups:

```bash
# Use this with an already running Molgenis site; e.g. master.dev.molgenis.org
yarn proxy
# Use this when you need to test with a certain Molgenis branch from IntelliJ
yarn proxy-services
# Use this when you want to work with a locally deployed Molgenis site
yarn proxy-molgenis
```

* Start the SCSS development service from another tab:

```bash
yarn dev
```

* Visit [localhost](http://localhost); you should see the proxied version of the public [dev server](https://master.molgenis.org)
  using the Bootstrap 4 version of *molgenis-red* theme

* Install the Chrome [livereload extension](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei)
  to autoreload on file-change

* Switch livereload on; try changing **$mg-color-primary** in **molgenis-red/_variables.scss**

  > The theme on the webpage should automatically update on save.

## Conventions

Both Bootstrap 3 & 4 CSS is being used in Molgenis, while it transitions to Bootstrap 4.
Make sure you check the current Molgenis page source to verify that the asserted theme
is being used. The setup of the themes is such, that the theme in **scss/molgenis**
provides sane defaults for *all* themes. All themes inherit their main settings from
this base theme.

When trying to fit in a new theme, please try to maintain the following workflow order:

* Apply Molgenis (mg-) variables in the myproject theme
* Update Bootstrap variables in scss/molgenis
* Refactor Molgenis variables in scss/molgenis if necessary
* Add selectors in scss/molgenis (_custom) using Molgenis variables

To keep theming maintainable for our future selves, it is absolutely **crucial**
that each theme refrains from applying custom styling, unless there is no
other option. Always make an effort to fit your "unique" use-case in the
base theme.

> Keep in mind that your changes are applied to all themes.

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

## Publishing

### Distribution

The generated theme CSS files are published to the [npm](http://npmjs.com/@molgenis/molgenis-theme)
package management service, as soon a [new version](https://github.com/molgenis/molgenis-theme/actions?query=workflow%3ACI)
is detected on the master branch. We use [Unpkg](https://unpkg.com/browse/@molgenis/molgenis-theme@latest/css/) to serve the
CSS files directly from npm. This way, you don't necessarily have to build the themes yourself.
Also, this may later be used as an alternative distribution mechanism, using a variation
of our Unpkg proxy setup, e.g.:

```nginx
location @molgenis{
    rewrite ^/@molgenis/molgenis-theme@1.5.0/css/mg-(?<theme>[-\w]+)-(?<version>[0-9]+).css /css/bootstrap-$version/bootstrap-$theme.min.css break;
    proxy_pass https://master.dev.molgenis.org;
    proxy_buffers 4 32k;
    proxy_ssl_session_reuse on;
}

location ~ ^/css/bootstrap-(?<version>[0-9]+)/bootstrap-(?<theme>[-\w]+).min.css {
    rewrite ^/css/bootstrap-(?<version>[0-9]+)/bootstrap-(?<theme>[-\w]+).min.css /@molgenis/molgenis-theme@1.5.0/css/mg-$theme-$version.css break;
    proxy_pass https://unpkg.com;
    proxy_intercept_errors on;
    error_page 404 = @molgenis;
}
```

### Dynamic Themes

This is a Proof-of-Concept theme service, that generates theme files on-the-fly.
Instead of requesting CSS files, a Molgenis instance just posts a set of variables
to this service. The accompanying theme file is then returned accordingly.

Usage:

* Start the SCSS service

  ```bash
  yarn serve
  ```

* Post a request body to the [theme endpoint](http://localhost:8080/theme) with a tool like Postman:

  ```json
  {
    "name": "molgenis-red",
    "version": 4,
    "mg-color-primary": "#005c8f",
    "mg-color-primary-light": "#0069a4"
  }
  ```

> Depending on the version (3 or 4), either the generated Bootstrap 3 or Bootstrap 4
  version is returned. Post validation is still a bit flunky, so it's easy to break.
