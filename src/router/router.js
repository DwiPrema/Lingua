import AuthPage from "@/views/AuthPage.vue";
import LandingPage from "@/views/LandingPage.vue";
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/",
            name: "landingPage",
            component: LandingPage
        },
        {
            path: "/login",
            name: "login",
            component: AuthPage
        },
        {
            path: "/signup",
            name: "signup",
            component: AuthPage
        },
    ]
})

export default router