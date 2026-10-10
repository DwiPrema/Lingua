import { useAuthStore } from "@/stores/auth_stores";
import { useOrganizationStore } from "@/stores/organization_stores";

import AuthPage from "@/views/AuthPage.vue";
import LandingPage from "@/views/LandingPage.vue";
import AdminDashboardPage from "@/views/AdminDashboardPage.vue";
import OrganizationSetup from "@/views/OrganizationSetup.vue";

import {
    createRouter,
    createWebHistory,
} from "vue-router";
import { useUserDataStores } from "@/stores/user_data_stores";
import { onMounted } from "vue";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),

    routes: [
        {
            path: "/",
            name: "landingPage",
            component: LandingPage,
        },

        // Guest routes
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

        // OTP verification
        {
            path: "/auth/verify",
            name: "auth-verify",
            component: AuthPage,
            meta: {
                requiresOtpFlow: true,
            },
        },

        // Protected routes
        {
            path: "/dashboard",
            name: "dashboard",
            component: AdminDashboardPage,
            meta: {
                requiresAuth: true,
                requiresInstructor: true,
                requiresOrganization: true,
            },
        },
        {
            path: "/organization/setup",
            name: "organization-setup",
            component: OrganizationSetup,
            meta: {
                requiresAuth: true,
                requiresInstructor: true,
            },
        },
    ],
});

router.beforeEach(async (to) => {
    const authStore = useAuthStore();
    const userDataStore = useUserDataStores();

    // 1. Inisialisasi autentikasi
    if (!authStore.isInitialized) {
        await authStore.initializeAuth();
    }

    const isAuthenticated = Boolean(authStore.session);

    // 2. Periksa alur OTP
    if (to.meta.requiresOtpFlow && !authStore.authIntent) {
        return { name: "auth-login" };
    }

    // 3. Lindungi route yang membutuhkan login
    if (to.meta.requiresAuth && !isAuthenticated) {
        return {
            name: "auth-login",
            query: { redirect: to.fullPath },
        };
    }

    // 4. Pengguna yang sudah login tidak perlu masuk login/signup
    if (to.meta.requiresGuest && isAuthenticated) {
        return { name: "landingPage" };
    }

    // 5. Ambil profil user sebelum memeriksa role
    if (isAuthenticated) {
        try {
            if (!userDataStore.userData) {
                await userDataStore.getUserData();
            }

            const role = userDataStore.userData?.role;

            console.log("User profile:", userDataStore.userData);
            console.log("Application role:", role);

            if (!role) {
                if (to.meta.requiresInstructor) {
                    return { name: "landingPage" };
                }

                return true;
            }

            // Student tidak boleh mengakses route instructor
            if (
                role === "student" &&
                to.meta.requiresInstructor
            ) {
                return { name: "landingPage" };
            }

            // Route khusus instructor
            if (
                to.meta.requiresInstructor &&
                role !== "instructor"
            ) {
                return { name: "landingPage" };
            }

            // Periksa organization
            if (
                role === "instructor" &&
                (
                    to.meta.requiresOrganization ||
                    to.name === "organization-setup"
                )
            ) {
                const organizationStore = useOrganizationStore();

                if (!organizationStore.organization) {
                    await organizationStore.fetchMyOrganization();
                }

                const hasOrganization =
                    organizationStore.hasOrganization;

                // Belum punya organization
                if (
                    to.meta.requiresOrganization &&
                    !hasOrganization
                ) {
                    return { name: "organization-setup" };
                }

                // Sudah punya organization
                if (
                    to.name === "organization-setup" &&
                    hasOrganization
                ) {
                    return { name: "dashboard" };
                }
            }
        } catch (error) {
            console.error("Route guard error:", error);

            // Jangan lanjutkan ke halaman protected jika
            // pemeriksaan profil atau organization gagal.
            if (to.meta.requiresAuth) {
                return { name: "landingPage" };
            }
        }
    }

    return true;
});

export default router;