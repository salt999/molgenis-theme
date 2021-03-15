# Molgenis Theme

Molgenis-theme is the SCSS/Bootstrap-based Molgenis theming source. Its purpose
is to streamline the theming workflow by:

* Simplifying the creation of new themes
* Making existing themes maintainable & consistent
* Providing a better frontend developer styling experience
* Establishing and simplifying the publishing & distibution workflow

## Prerequisites

* [Docker](https://docs.docker.com/docker-for-mac/install/)
* [Docker-compose](https://docs.docker.com/compose/install/)
* [Node.js](https://nodejs.org/dist/v14.9.0/node-v14.9.0.pkg) 14+
* [Yarn](https://classic.yarnpkg.com/en/docs/install/#mac-stable)
* [Visual Studio Code](https://code.visualstudio.com/docs/setup/mac)

## Getting started

```bash
git clone git@github.com:molgenis/molgenis-theme.git
cd molgenis-theme
yarn
# Set the default config file
cp .env.defaults .env
# Build the selected theme (MG_THEME in .env)
yarn build
```

:tada: Congratulations! You just generated the default *molgenis-blue* theme.

> CSS files were written to the **dist** directory. Each theme has a Bootstrap 3
and a Bootstrap 4 file.

## Configuration

The configuration for Docker and the SCSS tool are set from a shared
environment file; the **.env** file. It has the following options:

```bash
# Docker-specific; just ignore this.
COMPOSE_IGNORE_ORPHANS=True
COMPOSE_PROJECT_NAME=mg_projects

# Remote proxy only; use with 'yarn proxy'
MG_PROXY=https://master.dev.molgenis.org
# Docker host ip; use with 'yarn proxy-services'
# MG_PROXY=http://172.19.0.1:8080
# Docker service molgenis host; Use with 'yarn proxy-services-molgenis'
# MG_PROXY=http://molgenis:8080

# URL to the theme generator service from the NGINX docker container.
MG_PROXY_THEMEGEN=http://172.18.0.1:3030

# (!) The theme to serve and watch. Please note that
# you need to restart both the docker services and
# the SCSS tool after changing this variable.
MG_THEME=molgenis-blue
```

## Modify a Theme

* Serve the theme

  ```bash
  # Proxy master.dev.molgenis.org on http://localhost
  yarn proxy
  # Start dev-service from another console tab:
  yarn dev
  ```

* Open [localhost](http://localhost) in Chromium.

> This is the public [dev server](https://master.molgenis.org) using the local
styling of the *molgenis-blue* theme

* Install the Chrome
[livereload extension](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei)
* Switch livereload on
* Try changing variable **$mg-color-primary** in **molgenis-blue/_variables.scss**

The theme on the webpage should now automatically reflect your changes on save.
Browse through the [base theme](/scss/molgenis) to get an idea how a theme
is being constructed.

## Conventions

Bootstrap 3 & 4 CSS are being used in Molgenis. This creates extra overhead,
but is sadly a necessity while Bootstrap 3 is still in use in some apps.
When creating a new theme, please try to maintain the following workflow order:

* Use existing Bootstrap classes wherever possible
* Apply only variables from **/scss/molgenis/_variables.scss** in the theme
* Refactor Molgenis variables in scss/molgenis if necessary

> (!) Keep in mind that changes to the base theme are applied to **all** themes.

<details>
<summary><em>Common SCSS locations & their meaning</em></summary>

```markdown

* Bootstrap 3 variables are in `./node_modules/bootstrap-sass/assets/stylesheets/bootstrap/_variables.scss`
* Bootstrap 4 variables are in `./node_modules/bootstrap-scss/_variables.scss`
* `scss/molgenis/theme-3/_theme.scss` is the root of the Molgenis Bootstrap 3 theme
* `scss/molgenis/theme-4/_theme.scss` is the root of the Molgenis Bootstrap 4 theme
* Bootstrap 3 variables are customized in `./scss/molgenis/theme-3/_variables.scss`
* Bootstrap 4 variables are customized in `./scss/molgenis/theme-4/_variables.scss`
* `scss/molgenis/_variables.scss` contains themable variables that can be overridden in `./themes/mytheme/_variables.scss`
* Theme-agnostic fixes MUST be made in the main theme at `./scss/molgenis`
* Theme variables that differ between Bootstrap 3 and 4 start with a `mg-` prefix
* Theme variables that are similar in Bootstrap 3 and 4 are used directly without `mg-` prefix
* Do NOT use variables in themes that are not already in `scss/molgenis/_variables.scss`
* Keep `scss/molgenis/_variables.scss` small and tidy

This is mainly legacy. Custom selectors should be removed in the long run,
or moved to Vue theme-agnostic component styling:

* Generic selectors Bootstrap 3: `scss/molgenis/theme-3/_custom.scss`
* Molgenis elements Bootstrap 3: `scss/molgenis/theme-3/modules/_some-page-element.scss`
* Molgenis modules Bootstrap 3: `scss/molgenis/theme-3/modules/_some-module.scss`

* Generic selectors Bootstrap 4: `scss/molgenis/theme-4/_custom.scss`
* Molgenis elements Bootstrap 4: `scss/molgenis/theme-4/modules/_some-page-element.scss`
* Molgenis modules Bootstrap 4: `scss/molgenis/theme-4/modules/_some-module.scss`

* Generic selectors Bootstrap 3+4: `scss/molgenis/_custom.scss`
* Molgenis elements Bootstrap 3+4: `scss/molgenis/elements/_some-page-element.scss`
```

</details>

## Distribution

The generated theme CSS files are published to [npm](http://npmjs.com/@molgenis-ui/molgenis-theme)
as soon as a new fix/feat [commit](https://github.com/molgenis/molgenis-theme/actions?query=workflow%3ACI)
is detected on the master branch. [Unpkg](https://unpkg.com/browse/@molgenis-ui/molgenis-theme@latest/)
is used to serve the CSS files directly. The default urls for the Molgenis-blue theme are:

```bash
/@molgenis-ui/molgenis-theme/dist/themes/mg-molgenis-blue-4.css
/@molgenis-ui/molgenis-theme/dist/themes/mg-molgenis-blue-3.css
```

A new feature is to serve stylesheets dynamically. We would still have a set of
versioned and published themes to choose from, but also the option to generate
a theme from the Molgenis UI on-the-fly. This makes it easy for customers to
setup their own theme with just a few clicks. This requires a simple theming
service backend and a new [theming manager frontend](https://github.com/molgenis/molgenis-frontend/tree/poc/generated-themes).

* Start the SCSS service

  ```bash
  yarn service
  ```

> The theme-manager posts a request body like this to the [theming service endpoint](http://localhost:3030/theme):

  ```json
  {
    "name": "molgenis-blue",
    "variables": {
      "mg-color-primary": "#f00",
      "mg-color-primary-contrast": "#ff0",
      "mg-color-secondary": "#00f",
      "mg-color-secondary-contrast": "#0ff"
    }
  }
  ```

The response is:

```json
{
    "name": "molgenis-blue",
    "urls": [
        "mg-molgenis-blue-3-1614770277098.css",
        "mg-molgenis-blue-3-1614770277098.css"
    ],
    "timestamp": 1614770277098
}
```

* Go to the current theme-manager and choose *Use a custom theme*, fill in:

```bash
/generated/mg-molgenis-blue-4-1614770277098.css
/generated/mg-molgenis-blue-3-1614770277098.css
```

:tada: Congratulations! You just generated a dynamic theme.
