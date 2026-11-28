import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router/router";

import "./assets/main.css"
import { useAuthStore } from "./stores/auth_stores";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

const authStore = useAuthStore(pinia);

await authStore.initializeAuth();

await router.isReady();

app.mount("#app");