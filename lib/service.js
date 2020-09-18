import bodyParser from 'body-parser'
import express from 'express'
import Joi from '@hapi/joi'
import path from 'path'
import { scssRender } from './scss.js'


export default function(settings) {
    const scssOptions = {
        includePaths: settings.includePaths,
        write: false,
        optimize: true
    }

    // Allowed theme variables:
    const validator = Joi.object({
        name: Joi.string().required(),
        version: Joi.number().required(),
        'mg-color-primary': Joi.string().required(),
        'mg-color-primary-light': Joi.string().required(),
    })

    const app = express()
    app.use(bodyParser.json())

    app.post('/theme', async function(req, res, next) {
        const validated = validator.validate(req.body)
        if (validated.error) return next(validated.error)
        const parsed = validated.value

        let cssData = await scssRender(path.join(settings.dir.base, 'scss', 'molgenis', `theme-${parsed.version}`, '_theme.scss'), null, scssOptions)

        res.attachment(`mg-${parsed.name}-${parsed.version}.css`)
        res.send(cssData.rules)
        res.end()
    })


    app.listen(8080, () => {
        console.log("service listening on port 8080")
    })
}