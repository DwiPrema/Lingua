import { useAuthStore } from "@/stores/auth_stores";
import AuthPage from "@/views/AuthPage.vue";
import LandingPage from "@/views/LandingPage.vue";
import AdminDashboardPage from "@/views/AdminDashboardPage.vue";
import {
    createRouter,
    createWebHistory,
} from "vue-router";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),

    routes: [
        {
            path: "/",
            name: "landingPage",
            component: LandingPage,
        },

        // =========================
        // Guest routes
        // =========================
        {
            path: "/auth/login",
            name: "auth-login",
            component: AuthPage,
            meta: {
                requiresGuest: true,
            },
        },

        {
            path: "/auth/signup",
            name: "auth-signup",
            component: AuthPage,
            meta: {
                requiresGuest: true,
            },
        },

        // =========================
        // OTP verification
        // =========================
        {
            path: "/auth/verify",
            name: "auth-verify",
            component: AuthPage,
            meta: {
                requiresOtpFlow: true,
            },
        },

        // =========================
        // Protected routes
        // =========================
        {
            path: "/dashboard",
            name: "dashboard",
            component: AdminDashboardPage,
            meta: {
                requiresAuth: true,
            },
        },
    ],
});

router.beforeEach((to) => {
    const authStore = useAuthStore();

    console.log("Navigating to:", to.fullPath);
    console.log("User:", authStore.user);
    console.log("Session:", authStore.session);
    console.log("Requires auth:", to.meta.requiresAuth);

    // OTP verification
    if (to.meta.requiresOtpFlow && !authStore.authIntent) {
        return {
            name: "auth-login",
        };
    }

    // Protected route
    if (to.meta.requiresAuth && !authStore.user) {
        return {
            name: "auth-login",
        };
    }

    // Guest-only
    if (to.meta.requiresGuest && authStore.user) {
        return {
            name: "dashboard",
        };
    }

    return true;
});

export default router;