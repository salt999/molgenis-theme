# Molgenis Theme

This is the Bootstrap-based Molgenis SCSS theme generator. Its purpose is to
streamline the theming workflow for all Molgenis sites by:

* Simplifying the creation of new themes
* Keeping existing themes maintainable
* Keeping existing themes consistent by applying fixes to the base theme
* Providing a better frontend developer experience using a proxy/reload tool chain
* Establishing and simplifying the publishing & distibution workflow

## Prerequisites

* [Docker](https://docs.docker.com/docker-for-mac/install/)
* [Docker-compose](https://docs.docker.com/compose/install/)
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

:tada: Congratulations! You just generated the default *molgenis-blue* theme.

> CSS files were written to the **css** directory. Each theme has a Bootstrap 3
  and a Bootstrap 4 variant.

## Configuration

The configuration for Docker and the SCSS tool are read from a shared environment
file; the **.env** file. It has the following options:

```bash
# This is a Docker directive to make containers unique per project.
# Don't change this, unless you have a good reason to.
COMPOSE_PROJECT_NAME=mg_projects
# URL of a remote Molgenis instance to proxy (use with 'yarn proxy')
MG_PROXY=https://master.dev.molgenis.org
# Docker service name (use with 'yarn proxy-molgenis')
# MG_PROXY=http://molgenis:8080
# Docker host ip (use with 'yarn proxy-services')
# MG_PROXY=http://172.19.0.1:8080

# The local theme to serve and watch (/theme/...):
MG_THEME_LOCAL=molgenis-blue
# The proxy CSS theme to replace:
MG_THEME_PROXY=bootstrap-molgenis-blue.min.css
```

## Development

### Starting A New Theme

* Copy an existing theme to a new directory:

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

The proxy setup uses Nginx to apply locally developed theming files to a remotely
controlled Molgenis site, to make your life as a developer a bit easier. The
development service features auto-build of SCSS source-files and livereload of
stylesheets, so changes to your theme are automatically reflected in the browser.
It requires a bit of setup:

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

* Start the proxy in one of the three different setups:

  ```bash
  # When you want to style an existing Molgenis site; e.g. master.dev.molgenis.org
  yarn proxy
  # When you need to test with a certain local Molgenis branch (IntelliJ)
  yarn proxy-services
  # When you want to test with a locally deployed Molgenis site
  yarn proxy-molgenis
  ```

> Use the most simple option to get started; e.g. **yarn proxy**

* Start the SCSS development server from another tab:

```bash
yarn serve
```

* Visit [localhost](http://localhost) to see the public [dev server](https://master.molgenis.org)
  using the Bootstrap 4 version of the *molgenis-red* theme

* Install the Chrome [livereload extension](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei)
  to autoreload on file-change
* Switch livereload on
* Try changing variable **$mg-color-primary** in **molgenis-red/_variables.scss**

The theme on the webpage should now automatically reflect your changes on save.
Browse through the [base theme](/scss/molgenis) to get an idea how a theme
is being constructed. Checkout the mg-variables defintion file for the theming
variables that are customizable.

## Conventions

Both Bootstrap 3 & 4 CSS is being used in Molgenis while it transitions to Bootstrap 4.
Make sure you check the current Molgenis page source to verify that the asserted theme
is being used. The theme in **scss/molgenis** provides defaults for *all* themes, because
themes inherit their main settings from it. When creating a new theme, please try to
maintain the following workflow order:

* Apply **only** Molgenis (mg-) variables in your theme

To keep theming maintainable and your future self happy, it is **crucial**
that each theme refrains from applying custom styling, unless there is no
other option. Always make an effort to fit your "unique" use-case in the
base theme. In case the current theming variables are not providing
the required customization:

* Update Bootstrap variables in scss/molgenis
* Refactor Molgenis variables in scss/molgenis if necessary
* Add selectors in scss/molgenis (_custom) using Molgenis variables

> (!) Keep in mind that changes are applied to all themes.

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

The generated theme CSS files are published to [npm](http://npmjs.com/@molgenis-ui/molgenis-theme)
as soon as a new fix/feat [commit](https://github.com/molgenis/molgenis-theme/actions?query=workflow%3ACI)
is detected on the master branch. [Unpkg](https://unpkg.com/browse/@molgenis-ui/molgenis-theme@latest/)
is then used to serve the CSS files directly from this npm package. For instance, the default
urls for the Molgenis-blue theme are:

```bash
/@molgenis-ui/molgenis-theme/dist/themes/mg-molgenis-blue-4.css
/@molgenis-ui/molgenis-theme/dist/themes/mg-molgenis-blue-3.css
```

To use the local files during development(using the proxy from molgenis-theme),
simply change the theme urls to:

```bash
/themes/mg-molgenis-blue-4.css
/themes/mg-molgenis-blue-3.css
```

### Dynamic Themes

This is a Proof-of-Concept theme service, that generates theme files on-the-fly.
The idea is that customers can create themes themselves from a (TBD) theme-manager,
which lets them change a certain set of variables. In this case; instead of requesting CSS files,
a Molgenis instance would just post a set of variables to this service. The accompanying
theme file is then generated, cached and served accordingly.

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
