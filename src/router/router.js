import { useAuthStore } from "@/stores/auth_stores";
import { useOrganizationStore } from "@/stores/organization_stores";
import { useUserDataStores } from "@/stores/user_data_stores";

import AuthPage from "@/views/AuthPage.vue";
import LandingPage from "@/views/LandingPage.vue";
import AdminDashboardPage from "@/views/AdminDashboardPage.vue";
import OrganizationSetup from "@/views/OrganizationSetup.vue";

import {
    createRouter,
    createWebHistory,
} from "vue-router";
import AdminDashboardOverview from "@/components/AdminDashboardOverview.vue";
import OrganizationSetting from "@/components/OrganizationSetting.vue";
import CourseForm from "@/views/CourseForm.vue";


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
            component: AdminDashboardPage,
            meta: {
                requiresAuth: true,
                requiresInstructor: true,
                requiresOrganization: true,
            },
            children: [
                {
                    path: "",
                    name: "dashboard",
                    component: AdminDashboardOverview,
                    children: [
                        {
                            path: "/courses/create",
                            name: "course-create",
                            component: CourseForm,
                        },
                        {
                            path: "/courses/:courseId/edit",
                            name: "course-edit",
                            component: CourseForm,
                            props: true,
                        },
                    ]
                },
                {
                    path: "organization-settings",
                    name: "organization-settings",
                    component: OrganizationSetting,
                },
            ],
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

    if (!authStore.isInitialized) {
        await authStore.initializeAuth();
    }

    const isAuthenticated = Boolean(authStore.session);

    if (to.meta.requiresOtpFlow && !authStore.authIntent) {
        return { name: "auth-login" };
    }

    if (to.meta.requiresAuth && !isAuthenticated) {
        return {
            name: "auth-login",
            query: { redirect: to.fullPath },
        };
    }

    if (to.meta.requiresGuest && isAuthenticated) {
        return { name: "landingPage" };
    }

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


            if (
                role === "student" &&
                to.meta.requiresInstructor
            ) {
                return { name: "landingPage" };
            }


            if (
                to.meta.requiresInstructor &&
                role !== "instructor"
            ) {
                return { name: "landingPage" };
            }


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


                if (
                    to.meta.requiresOrganization &&
                    !hasOrganization
                ) {
                    return { name: "organization-setup" };
                }


                if (
                    to.name === "organization-setup" &&
                    hasOrganization
                ) {
                    return { name: "dashboard" };
                }
            }
        } catch (error) {
            console.error("Route guard error:", error);

            if (to.meta.requiresAuth) {
                return { name: "landingPage" };
            }
        }
    }

    return true;
});

export default router;