import LandingPage from "@/views/LandingPage.vue";
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/",
            name: "landingPage",
            component: LandingPage
        }
    ]
})

export default router