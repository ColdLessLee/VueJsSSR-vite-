import { createMYApplication } from "./main";

const { app, router } = createMYApplication()

router.isReady().then(() => { 
    app.mount('#app')
})