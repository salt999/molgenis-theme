#!/usr/bin/env node
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
    const asyncTasks = []
    asyncTasks.push(tasks.themeFile.start())

    if (settings.all) {
        const themes = await (await fs.readdir(settings.dir.theme, {withFileTypes: true})).filter((i) => i.isDirectory())
        asyncTasks.push(themes.map((theme) => tasks.scss.start(theme.name)))
    } else {
        asyncTasks.push(tasks.scss.start(settings.MG_THEME_LOCAL))
    }

    await Promise.all(asyncTasks)
})


/**
 * Public index file for themes; used for dynamic theme selection.
 */
tasks.themeFile = new Task('index', async function() {
    const themeInfo = []
    const themeFile = JSON.parse((await fs.readFile(path.join(settings.dir.theme, 'theme.json'))))
    const themes = await (await fs.readdir(settings.dir.theme, {withFileTypes: true})).filter((i) => i.isDirectory())

    for (const {name: themeName} of themes) {
        if (themeFile[themeName]) {
            themeInfo.push(themeFile[themeName])
        } else {
            themeInfo.push({name: themeName, share: false})
        }
    }

    fs.writeFile(path.join(settings.dir.css, 'theme.json'), JSON.stringify(themeInfo))
})


tasks.dev = new Task('dev', async function() {
    await tasks.build.start()
    return new Promise((resolve) => {
        var app = connect()
        app.use(tinylr.middleware({app}))
        app.listen({host: '127.0.0.1', port: 35729}, () => resolve)

        chokidar.watch([
            path.join(settings.dir.theme, settings.MG_THEME_LOCAL, '**', '*.scss'),
            path.join(settings.dir.base, 'scss', '**', '*.scss')
        ]).on('change', async(file) => {
            await tasks.scss.start(settings.MG_THEME_LOCAL)
            tinylr.changed(settings.MG_THEME_PROXY)
        })
    })
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


;(async() => {
    settings = await loadSettings()

    yargs
        .usage('Usage: $0 [task]')
        .detectLocale(false)
        .option('all', {default: false, description: 'Apply task to all themes', type: 'boolean'})
        .option('optimize', {alias: 'o', default: false, description: 'Optimize build for production', type: 'boolean'})
        .middleware(async(argv) => {
            if (!settings.version) {
                settings.version = JSON.parse((await fs.readFile(path.join(settings.dir.base, 'package.json')))).version
            }


            settings.all = argv.all
            settings.optimize = argv.optimize

            buildInfo({
                // eslint-disable-next-line no-console
                log(...args) {console.log(...args)},
                settings,
            })
        })

        .command('build', `build project files`, () => {}, () => {tasks.build.start()})
        .command('config', 'list build config', () => {}, () => {})  // Build info is shown when the task executes.
        .command('dev', `development mode`, () => {}, () => {tasks.dev.start()})
        .command('index', `build theme index file`, () => {}, () => {tasks.themeFile.start()})
        .command('scss', `build stylesheets for ${settings.MG_THEME_LOCAL}`, () => {}, () => {tasks.scss.start(settings.MG_THEME_LOCAL)})
        .command('serve', `start theme generator service`, () => {}, () => {
            scssService(settings)
        })
        .demandCommand()
        .help('help')
        .showHelpOnFail(true)
        .argv
})()


