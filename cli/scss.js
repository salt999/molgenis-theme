import CleanCSS from 'clean-css'
import fs from 'fs-extra'
import notifier from 'node-notifier'
import path from 'path'
import sass from 'node-sass'

const cleanCSS = new CleanCSS({level: 2, returnPromise: true, sourceMap: true})

export const scssRender = async function(themeFile, cssTarget, options) {
    // The source file itself has to be added to the includePath,
    // when using Sass' data option, instead of file. The data option
    // is needed to be able to prepend data.
    const sourcePath = path.dirname(themeFile)
    options.includePaths.push(sourcePath)

    let themeData = await fs.readFile(themeFile, 'utf-8')
    if (options.prependData) {
        themeData = options.prependData + themeData
    }
    return new Promise((resolve, reject) => {
        sass.render({
            data: themeData,
            includePaths: options.includePaths,
            outFile: cssTarget,
            sourceMap: !options.optimize,
            sourceMapContents: true,
            sourceMapEmbed: false,
        }, async function(err, sassObj) {
            if (err) {
                notifier.notify({title: 'SCSS Error', message: err.formatted})
                return reject(err.formatted)
            }
            let cssRules
            const promises = []

            if (options.optimize) {
                cssRules = (await cleanCSS.minify(sassObj.css)).styles
            } else {
                if (!sassObj) return reject('invalid scss')
                cssRules = sassObj.css
                if (options.write) promises.push(fs.writeFile(`${cssTarget}.map`, sassObj.map))
            }

            if (options.write) {
                promises.push(fs.writeFile(cssTarget, cssRules))
            }
            await Promise.all(promises)
            resolve({size: cssRules.length, rules: cssRules})
        })
    })
}


export default {
    scssRender
}