import { useAuthStore } from "@/stores/auth_stores";
import { useOrganizationStore } from "@/stores/organization_stores";
import { useUserDataStores } from "@/stores/user_data_stores";

import AuthPage from "@/views/auth/AuthPage.vue";
import LandingPage from "@/views/LandingPage.vue";
import AdminDashboardPage from "@/views/admin/AdminDashboardPage.vue";
import OrganizationSetup from "@/views/organization/OrganizationSetup.vue";
import AdminDashboardOverview from "@/views/admin/AdminDashboardOverview.vue";
import OrganizationSetting from "@/views/organization/OrganizationSetting.vue";
import CourseForm from "@/views/course/CourseForm.vue";
import AdminCourseDetailSection from "@/views/admin/AdminCourseDetailSection.vue";
import CourseProgramForm from "@/views/course/CourseProgramForm.vue";
import ProfilePage from "@/views/profile/ProfilePage.vue";
import StudentDashboardPage from "@/views/student/StudentDashboardPage.vue";
import {
    createRouter,
    createWebHistory,
} from "vue-router";
import StudentDashboardOverview from "@/views/student/StudentDashboardOverview.vue";
import EnrollmentFormPage from "@/views/enrollments/EnrollmentFormPage.vue";
import EnrollmentDetailPage from "@/views/enrollments/EnrollmentDetailPage.vue";
import EnrollmentView from "@/views/enrollments/EnrollmentView.vue";
import CoursesExplorer from "@/views/course/CoursesExplorer.vue";
import GuestCourseExplorer from "@/views/course/GuestCourseExplorer.vue";
import CourseDetail from "@/views/course/CourseDetail.vue";
import ManageStudentPage from "@/views/student/ManageStudentPage.vue";
import ManageEnrollmentPage from "@/views/enrollments/ManageEnrollmentPage.vue";
import InvoiceDetailView from "@/views/invoices/InvoiceDetailView.vue";
import PaymentView from "@/views/payment/PaymentView.vue";
import StudentDetailPage from "@/views/student/StudentDetailPage.vue";

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
            path: "/courses/:id",
            name: "guest.course-detail",
            component: CourseDetail,
        },
        {
            path: "/explore-courses",
            name: "guest.explore-courses",
            component: GuestCourseExplorer,
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
                            name: "instructor.profile",
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
                {
                    path: "/courses/:courseId/manage-student",
                    name: "manage-student",
                    component: ManageStudentPage,
                    props: true,
                },
                {
                    path: "/courses/:courseId/manage-student/:enrollmentId",
                    name: "manage-student-detail",
                    component: StudentDetailPage,
                },
                {
                    path: "/courses/:courseId/manage-enrollments",
                    name: "manage-enrollment",
                    component: ManageEnrollmentPage,
                    props: true,
                }
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
                    name: "student.profile",
                    component: ProfilePage,
                },
                {
                    path: "explore",
                    name: "student.explore",
                    component: CoursesExplorer,
                },
                {
                    path: "courses/:courseId/programs/:programId/enroll",
                    name: "student.enrollment-form",
                    component: EnrollmentFormPage,
                },
                {
                    path: 'enrollments',
                    name: 'student.enrollments',
                    component: EnrollmentView,
                },
                {
                    path: 'enrollments/:enrollmentId',
                    name: 'student.enrollment-detail',
                    component: EnrollmentDetailPage,
                },
                {
                    path: "courses/:id",
                    name: "student.course-detail",
                    component: CourseDetail,
                },
                {
                    path: "/student/invoices/:invoiceId",
                    name: "student.invoice-detail",
                    component: InvoiceDetailView,
                    meta: {
                        requiresAuth: true,
                        requiresStudent: true,
                    },
                },
                {
                    path: "/student/invoices/:invoiceId/payment",
                    name: "student.payment",
                    component: PaymentView,
                    meta: {
                        requiresAuth: true,
                        requiresStudent: true,
                    },
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

    // OTP flow
    if (to.meta.requiresOtpFlow && !authStore.authIntent) {
        return { name: "auth-login" };
    }

    // Authentication
    if (to.meta.requiresAuth && !isAuthenticated) {
        return {
            name: "auth-login",
            query: { redirect: to.fullPath },
        };
    }

    if (!isAuthenticated) return true;

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

        const isOrganizationSetup =
            to.name === "organization-setup";

        const isCreatorOnboarding =
            role === "student" &&
            authStore.registrationIntent === "create";

        // CREATOR ONBOARDING
        // Creator yang belum menyelesaikan setup hanya boleh
        // mengakses halaman Organization Setup.
        if (isCreatorOnboarding) {
            if (!isOrganizationSetup) {
                return { name: "organization-setup" };
            }

            return true;
        }

        // Guest-only pages
        if (to.meta.requiresGuest) {
            if (role === "student") {
                return { name: "student.dashboard" };
            }

            if (role === "instructor") {
                return { name: "dashboard" };
            }
        }

        // Student access
        if (to.meta.requiresStudent && role !== "student") {
            if (role === "instructor") {
                return { name: "dashboard" };
            }

            return { name: "landingPage" };
        }

        // Instructor access
        if (
            to.meta.requiresInstructor &&
            role !== "instructor"
        ) {
            if (role === "student") {
                return { name: "student.dashboard" };
            }

            return { name: "landingPage" };
        }

        // Organization access
        if (
            role === "instructor" &&
            (
                to.meta.requiresOrganization ||
                isOrganizationSetup
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
                isOrganizationSetup &&
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

    return true;
});

export default router;