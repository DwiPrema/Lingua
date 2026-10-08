import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router/router.js";

import "./assets/main.css"

import { useAuthStore } from "@/stores/auth_stores.js";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

const authStore = useAuthStore(pinia);

// Ambil session awal terlebih dahulu
await authStore.initializeAuth();

// Setelah itu dengarkan perubahan auth
const subscription =
    authStore.listenToAuthChanges();

await router.isReady();

app.mount("#app");