const express = require('express')
const path = require('path')
const fs = require('fs')

const { createServer: createViteServer } = require('vite')
const isTest= process.env.NODE_ENV === 'test' || !!process.env.VITE_TEST_BUILD

async function openServer (root = process.cwd(),
    isProd = process.env.NODE_ENV === 'production'
) {

    const resolves = t => path.resolve(__dirname, t)

    const indexProd = isProd ? fs.readFileSync(resolves('dist/client/index.html'), 'utf-8') : ''

    const manifest = isProd ? require('./dist/client/ssr-manifest.json') : {}

    const expressApplication = express()

    let viteApplication = undefined


    if (!isProd) {
        viteApplication = await createViteServer({
            root,
            logLevel: isTest ? 'error' : 'info',
            server: {
                middlewareMode: 'ssr',
                watch: {
                    usePolling: true,
                    interval: 100
                }
            }
        })
        expressApplication.use(viteApplication.middlewares)
    } else {
        expressApplication.use(require('compression')())
        expressApplication.use(
            require('serve-static')(resolves('dist/client'), {
                index: false
            })
        )
    }





    expressApplication.use('*', async (request, response) => {
        try {
            const reqUrl = request.originalUrl

            let SSRTemplate, SSRrender




            if (!isProd) {

                SSRTemplate = fs.readFileSync(
                    resolves('index.html'), 'utf-8'
                )
                SSRTemplate = await viteApplication.transformIndexHtml(reqUrl, SSRTemplate)

                SSRrender = (await viteApplication.ssrLoadModule('/src/entry-server.js')).ssrRenderFunction

            } else {
                SSRTemplate = indexProd
                SSRrender = require('./dist/server/entry-server.js').ssrRenderFunction
            }



            const [appHtml, preloadLinks] = await SSRrender(reqUrl, manifest)

            const responseHTML = SSRTemplate.replace(`<!--ssr_mode-->`, appHtml).replace(`<!--ssr_preload_links-->`, preloadLinks)


            response.status(200).set({ 'Content-type': 'text/html' }).end(responseHTML)
        } catch (e) {
            viteApplication && viteApplication.ssrFixStacktrace(e)
            console.error(e.stack)
            response.status(500).end(e.stack)
        }

    })
    return { expressApplication, viteApplication }
}

if (!isTest) {
    openServer().then(({ expressApplication }) => {
        expressApplication.listen(3000, () => {
            console.log('http://localhost:3000')
        })
    })
}

exports.createServer = openServer




