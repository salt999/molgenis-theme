import bodyParser from 'body-parser'
import express from 'express'
import fs from 'fs-extra'
import Joi from '@hapi/joi'
import mkdirp from 'mkdirp'
import path from 'path'
import { performance } from 'perf_hooks'
import pino from 'pino'
import { scssRender } from './scss.js'

const logger = pino()

const validator = Joi.object({
    name: Joi.string().required(),
    variables: Joi.object().keys({
        'mg-color-primary': Joi.string().required(),
        'mg-color-primary-contrast': Joi.string().required(),
        'mg-color-secondary': Joi.string().required(),
        'mg-color-secondary-contrast': Joi.string().required(),
    }).required()
})

function sassVariables(variables) {
    return Object.keys(variables).map((name) => {
        return `$${name}: ${variables[name]};`
    }).join('\n')
}

export default async function(settings) {
    // Make sure the generated directory exists:
    const cssDir = path.join(settings.dir.base, 'dynamic')
    await mkdirp(cssDir)

    const scssOptions = {
        includePaths: settings.includePaths,
        write: false,
        optimize: true
    }

    const app = express()
    app.use(bodyParser.json())

    app.post('/theme', async function(req, res, next) {
        const startTime = performance.now()
        const validated = validator.validate(req.body)
        if (validated.error) {
            return next(validated.error)
        }
        const parsed = validated.value
        scssOptions.prependData = sassVariables(parsed.variables)

        const [b3Data, b4Data] = await Promise.all([
            scssRender(path.join(settings.dir.base, 'scss', 'molgenis', `theme-3`, '_dynamic.scss'), null, scssOptions),
            scssRender(path.join(settings.dir.base, 'scss', 'molgenis', `theme-4`, '_dynamic.scss'), null, scssOptions)
        ])

        const timestamp = new Date().getTime()

        const b3File = `mg-${parsed.name}-3-${timestamp}.css`
        const b4File = `mg-${parsed.name}-4-${timestamp}.css`

        await Promise.all([
            fs.writeFile(path.join(cssDir,  b3File), b3Data.rules),
            fs.writeFile(path.join(cssDir,  b4File), b4Data.rules)
        ])
        const spendTime = `${Number(performance.now() - startTime).toFixed(1)}ms`
        logger.info(`generated theme '${parsed.name}' in ${spendTime}`)
        res.end(JSON.stringify({
            name: parsed.name,
            urls: [b3File, b3File],
            timestamp
        }))
    })


    app.listen(3030, () => {
        console.log("service listening on port 3030")
    })
}