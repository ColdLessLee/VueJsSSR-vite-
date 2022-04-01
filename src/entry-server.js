import { createMYApplication } from "./main"
import { renderToString } from "vue/server-renderer"
import path, { basename } from "path"

export async function ssrRenderFunction (url, manifest) {
    const { app, router } = createMYApplication()

    router.push(url)
    await router.isReady()

    const context = {}
    const html = await renderToString(app, context)

    const preloadLinks = renderPreloadLinks(context.modules, manifest)
    
    return[html,preloadLinks]
}
function renderPreloadLinks(modules,manifest) {
    let links = ''
    const seen = new Set()
    modules.forEach(id => { 
        const files = manifest[id]
        if (files) { 
            files.forEach(file => { 
                if (!seen.has(file)) { 
                    seen.add(file)
                    const fileName = basename(file)
                    if (manifest[fileName]) { 
                        for (const depFile of manifest[fileName]) { 
                            links += renderPreloadLink(depFile)
                            seen.add(depFile)
                        }
                    }
                    links +=renderPreloadLink(file)
                }
            })
        }
    })
    return links
}

function renderPreloadLink(_file) {
    if (_file.endsWith('.js')) {
        return `<link rel="modulepreload" crossorgin href="${_file}">`
    }
    else if (_file.endsWith('.css')) {
        return `<link rel="stylesheet" href="${_file}">`
    }
    else if (_file.endsWith('.jpg')) {
        return `<link rel="preload" href="${_file}" as="image/jpeg">`
    }
    else if (_file.endsWith('.png')) {
        return `<link rel="preload" href="${_file}" as="image/png">`
    } else { 
        return ''
    }

}