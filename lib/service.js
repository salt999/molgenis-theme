import bodyParser from 'body-parser'
import express from 'express'
import Joi from '@hapi/joi'
import scssRender from './scss.js'

const validator = Joi.object({
    'name': Joi.string().required(),
    'mg-color-primary': Joi.string().required(),
    'mg-color-primary-light': Joi.string().required(),
})


const app = express()
app.use(bodyParser.json())

app.post('/theme', async function(req, res, next) {
    const validated = validator.validate(req.body)
    if (validated.error) return next(validated.error)
    const parsed = validated.value

    const themeDir = path.join(settings.dir.theme, theme, 'scss')
    await Promise.all([
        scssRender(path.join(settings.dir.base, 'scss', 'molgenis', 'theme-3', '_theme-3.scss'), `mg-${parsed.name}-3.css`),
        scssRender(path.join(settings.dir.base, 'scss', 'molgenis', 'theme-4', '_theme-4.scss'), `mg-${parsed.name}-4.css`)
    ])

    console.log('scss', scssRender)

    console.log("validated", parsed)
})

export default function() {
    app.listen(8080, () => {
        console.log("LISTENING")
    })
}