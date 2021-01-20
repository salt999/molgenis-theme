#!/usr/bin/env node
import {buildInfo} from './utils.js'
import chokidar from 'chokidar'
import connect from 'connect'
import fs from 'fs-extra'

import loadSettings from './settings.js'
import mkdirp from 'mkdirp'

import path from 'path'

import Task from './task.js'
import tinylr from 'tiny-lr'
import yargs from 'yargs'
import { scssRender } from './scss.js'
import scssService from './service.js'


let settings
const tasks = {}


tasks.assets = new Task('assets', async function() {
    await Promise.all([
        fs.copy(path.join(settings.dir.base, 'fonts'), path.join(settings.dir.build, 'fonts', )),
    ])
})


tasks.build = new Task('build', async function() {
    const asyncTasks = []
    asyncTasks.push(tasks.themeIndex.start())
    asyncTasks.push(tasks.assets.start())

    if (settings.all) {
        const themes = await (await fs.readdir(settings.dir.themes, {withFileTypes: true})).filter((i) => i.isDirectory())
        asyncTasks.push(themes.map((theme) => tasks.scss.start(theme.name)))
    } else {
        asyncTasks.push(tasks.scss.start(settings.MG_THEME))
    }

    await Promise.all(asyncTasks)
})


/**
 * Public index file for themes; used for dynamic theme selection.
 */
tasks.themeIndex = new Task('index', async function() {
    const themeInfo = []
    const themeFile = JSON.parse((await fs.readFile(path.join(settings.dir.themes, 'index.json'))))
    const themes = await (await fs.readdir(settings.dir.themes, {withFileTypes: true})).filter((i) => i.isDirectory())

    for (const {name: themeId} of themes) {
        if (themeFile[themeId]) {
            themeInfo.push({id: themeId, ...themeFile[themeId]})
        } else {
            themeInfo.push({id: themeId, share: false})
        }
    }

    fs.writeFile(path.join(settings.dir.build, 'themes', 'index.json'), JSON.stringify(themeInfo))
})


tasks.serve = new Task('serve', async function() {
    await tasks.build.start()
    return new Promise((resolve) => {
        var app = connect()
        app.use(tinylr.middleware({app}))
        app.listen({host: '127.0.0.1', port: 35729}, () => resolve)

        chokidar.watch([
            path.join(settings.dir.themes, settings.MG_THEME, '**', '*.scss'),
            path.join(settings.dir.base, 'scss', '**', '*.scss')
        ]).on('change', async(file) => {
            await tasks.scss.start(settings.MG_THEME)
            tinylr.changed(`mg-${settings.MG_THEME}-3.css`)
            tinylr.changed(`mg-${settings.MG_THEME}-4.css`)
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

    const themeDir = path.join(settings.dir.themes, theme)
    await Promise.all([
        scssRender(path.join(themeDir, 'theme-3.scss'), path.join(settings.dir.build, 'themes', `mg-${theme}-3.css`), scssOptions),
        scssRender(path.join(themeDir, 'theme-4.scss'), path.join(settings.dir.build, 'themes', `mg-${theme}-4.css`), scssOptions)
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
            await mkdirp(path.join(settings.dir.build, 'themes'))
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
        .command('assets', `build asset files`, () => {}, () => {tasks.assets.start()})
        .command('build', `build project files`, () => {}, () => {tasks.build.start()})
        .command('config', 'list build config', () => {}, () => {})  // Build info is shown when the task executes.
        .command('serve', `development mode`, () => {}, () => {tasks.serve.start()})
        .command('index', `build theme index file`, () => {}, () => {tasks.themeIndex.start()})
        .command('scss', `build stylesheets for ${settings.MG_THEME}`, () => {}, () => {tasks.scss.start(settings.MG_THEME)})
        .command('service', `start theme generator service`, () => {}, () => {
            scssService(settings)
        })
        .demandCommand()
        .help('help')
        .showHelpOnFail(true)
        .argv
})()


