const fs = require('fs')
const path = require('path')

const Absolutions = p => path.resolve(__dirname, p)

const manifest = require('./dist/static/ssr-manifest.json')

const template = fs.readFileSync(Absolutions('dist/static/index.html'), 'utf-8')
const { ssrRenderFunction } = require('./dist/server/entry-server.js')

const routesToPrerender = fs.readFileSync(Absolutions('src/pages')).map(file => {
    const name = file.replace(/\.vue$/, '').toLowerCase()
    return name === '/home' ? `/` : `/${name}`
});

(async () => { 
    for (const url of routesToPrerender) { 
        const [appHtml, preloadLinks] = await ssrRenderFunction(url, manifest)
        
        const html = template.replace(` <!--ssr_preload_links-->`, preloadLinks).replace(`<!--ssr_mode-->`, appHtml)
        
        const filePath = `dist/static${url === '/' ? '/index' : url}.html`
        fs.writeFileSync(Absolutions(filePath), html)
        console.log('pre-rendered:',filePath)
    }
    fs.unlinkSync(Absolutions('dist/static/ssr-manifest.json'))
})()