#!/usr/bin/env node
import _ from 'lodash'
import {buildInfo} from './lib/utils.js'
import chalk from 'chalk'
import chokidar from 'chokidar'
import connect from 'connect'
import fs from 'fs-extra'

import loadSettings from './lib/settings.js'

import path from 'path'

import Task from './lib/task.js'
import tinylr from 'tiny-lr'
import yargs from 'yargs'
import { scssRender } from './lib/scss.js'
import scssService from './lib/service.js'


let settings
const tasks = {}


tasks.build = new Task('build', async function() {
    if (settings.all) {
        const themes = await fs.readdir(settings.dir.theme)
        await Promise.all(themes.map((theme) => tasks.scss.start(theme)))
    } else {
        await tasks.scss.start(settings.MG_THEME)
    }
})


/**
 * Some Molgenis views use Bootstrap 3, others use Bootstrap 4.
 * The result should look the same with the least amount of
 * customization.
 */
tasks.scss = new Task('scss', async function(ep) {
    let theme = ep.raw

    const scssOptions = {
        includePaths: settings.includePaths,
        write: true,
        optimize: settings.optimize,
    }

    const themeDir = path.join(settings.dir.theme, theme)
    await Promise.all([
        scssRender(path.join(themeDir, 'theme-3.scss'), path.join(settings.dir.css, `mg-${theme}-3.css`), scssOptions),
        scssRender(path.join(themeDir, 'theme-4.scss'), path.join(settings.dir.css, `mg-${theme}-4.css`), scssOptions)
    ])
})


tasks.dev = new Task('dev', async function() {
    await tasks.build.start()
    return new Promise((resolve) => {
        var app = connect()
        app.use(tinylr.middleware({app}))
        app.listen({host: '127.0.0.1', port: 35729}, () => resolve)
        console.log(path.join(settings.dir.theme, settings.MG_THEME, '**', 'scss', '*.scss'))
        chokidar.watch([
            path.join(settings.dir.theme, settings.MG_THEME, '**', '*.scss'),
            path.join(settings.dir.base, 'scss', '**', '*.scss')
        ]).on('change', async(file) => {
            await tasks.scss.start(settings.MG_THEME)
            tinylr.changed(settings.MG_WATCHFILE)
        })
    })
})


;(async() => {
    settings = await loadSettings()

    const cli = {
        // eslint-disable-next-line no-console
        log(...args) {console.log(...args)},
        settings,
    }

    buildInfo(cli)

    yargs
        .usage('Usage: $0 [task]')
        .detectLocale(false)
        .option('all', {default: false, description: 'Apply to all themes', type: 'boolean'})
        .option('optimize', {alias: 'o', default: false, description: 'Optimize for production', type: 'boolean'})
        .middleware(async(argv) => {
            if (!settings.version) {
                settings.version = JSON.parse((await fs.readFile(path.join(settings.dir.base, 'package.json')))).version
            }



            if (['dev', 'scss'].includes(argv._)) {
                tasks.dev.log(`\r\n${chalk.bold('THEME:')} ${chalk.cyan(settings.MG_THEME)}`)
                tasks.dev.log(`${chalk.bold('MINIFY:')} ${chalk.grey(settings.optimize)}\r\n`)
            }
            if (argv._.includes('dev')) {
                tasks.dev.log(`${chalk.bold('WATCH FILE:')} ${chalk.cyan(settings.MG_WATCHFILE)}`)
            }

            settings.all = argv.all
            settings.optimize = argv.optimize
        })

        .command('build', `build project files`, () => {}, () => {tasks.build.start()})
        .command('config', 'list build config', () => {}, () => {})  // Build info is shown when the task executes.
        .command('dev', `development mode`, () => {}, () => {tasks.dev.start()})
        .command('scss', `build stylesheets for ${settings.MG_THEME}`, () => {}, () => {tasks.scss.start(settings.MG_THEME)})
        .command('serve', `start theme generator service`, () => {}, () => {
            scssService(settings)
        })
        .demandCommand()
        .help('help')
        .showHelpOnFail(true)
        .argv
})()


