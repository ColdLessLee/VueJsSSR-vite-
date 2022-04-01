import { createSSRApp } from 'vue'
import { createMyRouter} from './router'
import App from './App.vue'


export function createMYApplication() {
    const app = createSSRApp(App)
    const router = createMyRouter()
    app.use(router)
    return {app,router}
}
