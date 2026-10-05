import { useAuthStore } from "@/stores/auth.stores";
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
            path: "/auth/login",
            name: "auth-login",
            component: AuthPage
        },
        {
            path: "/auth/signup",
            name: "auth-signup",
            component: AuthPage
        },
        {
            path: "/auth/verify",
            name: "auth-verify",
            component: AuthPage,
            meta: {
                requiresOtpFlow: true
            }

        },
    ]
})

router.beforeEach((to) => {
    if (to.meta.requiresOtpFlow) {
        const authStore = useAuthStore()

        if (!authStore.authIntent) {
            return { name: 'auth-login' }
        }
    }
})

export default router