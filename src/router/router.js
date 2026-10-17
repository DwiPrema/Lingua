
import { useAuthStore } from "@/stores/auth_stores";
import { useOrganizationStore } from "@/stores/organization_stores";
import { useUserDataStores } from "@/stores/user_data_stores";

import AuthPage from "@/views/AuthPage.vue";
import LandingPage from "@/views/LandingPage.vue";
import AdminDashboardPage from "@/views/AdminDashboardPage.vue";
import OrganizationSetup from "@/views/OrganizationSetup.vue";
import AdminDashboardOverview from "@/components/AdminDashboardOverview.vue";
import OrganizationSetting from "@/components/OrganizationSetting.vue";
import CourseForm from "@/views/CourseForm.vue";
import AdminCourseDetailSection from "@/components/AdminCourseDetailSection.vue";
import CourseProgramForm from "@/views/CourseProgramForm.vue";
import ProfilePage from "@/views/ProfilePage.vue";
import StudentDashboardPage from "@/views/StudentDashboardPage.vue";

import {
    createRouter,
    createWebHistory,
} from "vue-router";
import StudentDashboardOverview from "@/components/StudentDashboardOverview.vue";
import StudentCourseDetailSection from "@/components/StudentCourseDetailSection.vue";
import StudentExploreCourse from "@/components/StudentExploreCourse.vue";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),

    routes: [
        {
            path: "/",
            name: "landingPage",
            component: LandingPage,
        },
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
        {
            path: "/auth/verify",
            name: "auth-verify",
            component: AuthPage,
            meta: {
                requiresOtpFlow: true,
            },
        },
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
                            path: "courses/create",
                            name: "course-create",
                            component: CourseForm,
                        },
                        {
                            path: "courses/:courseId/edit",
                            name: "course-edit",
                            component: CourseForm,
                            props: true,
                        },
                        {
                            path: "profile",
                            name: "profile",
                            component: ProfilePage,
                        },
                    ],
                },
                {
                    path: "organization-settings",
                    name: "organization-settings",
                    component: OrganizationSetting,
                },
                {
                    path: "courses/:courseId",
                    name: "course-detail",
                    component: AdminCourseDetailSection,
                },
                {
                    path: "/courses/:courseId/programs/create",
                    name: "course-program-create",
                    component: CourseProgramForm,
                },
                {
                    path: "/courses/:courseId/programs/:programId/edit",
                    name: "course-program-edit",
                    component: CourseProgramForm,
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
        {
            path: "/student",
            component: StudentDashboardPage,
            meta: {
                requiresAuth: true,
                requiresStudent: true,
            },
            children: [
                {
                    path: "",
                    name: "student.dashboard",
                    component: StudentDashboardOverview,
                },
                {
                    path: "profile",
                    name: "profile",
                    component: ProfilePage,
                },
                {
                    path: "explore",
                    name: "student.explore",
                    component: StudentExploreCourse,
                },
                {
                    path: "enrollments",
                    name: "student.enrollments",
                },
                {
                    path: "courses/:id",
                    name: "student.course-detail",
                    component: StudentCourseDetailSection,
                },
            ],
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

    if (isAuthenticated) {
        try {
            if (!userDataStore.userData) {
                await userDataStore.getUserData();
            }

            const role = userDataStore.userData?.role;

            if (!role) {
                if (to.meta.requiresInstructor || to.meta.requiresStudent) {
                    return { name: "landingPage" };
                }

                return true;
            }

            if (role === "student" && to.name === "landingPage") {
                return { name: "student.dashboard" };
            }

            if (to.meta.requiresGuest) {
                if (role === "student") {
                    return { name: "student.dashboard" };
                }

                if (role === "instructor") {
                    return { name: "dashboard" };
                }
            }

            if (to.meta.requiresStudent && role !== "student") {
                if (role === "instructor") {
                    return { name: "dashboard" };
                }

                return { name: "landingPage" };
            }

            if (role === "student" && to.meta.requiresInstructor) {
                return { name: "student.dashboard" };
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