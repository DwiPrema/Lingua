<script setup lang="ts">
import {
    computed,
    nextTick,
    onMounted,
    ref,
    watch,
} from "vue";
import { RouterView, useRoute, useRouter } from "vue-router";

import { useCourseStores } from "@/stores/course_stores.js";
import { useOrganizationStore } from "@/stores/organization_stores.js";
import AdminDashboardCourseSection from "./AdminDashboardCourseSection.vue";
import CustomButton from "@/components/CustomButton.vue";
import { User } from "@lucide/vue";
import EnrollmentsOverviewSection from "./EnrollmentsOverviewSection.vue";

const router = useRouter();
const route = useRoute();

const courseStore = useCourseStores();
const organizationStore = useOrganizationStore();

const loading = computed(() => courseStore.loading);
const organization = computed(() => organizationStore.organization);

const routeContent = ref<HTMLElement | null>(null);

watch(
    () => route.name,
    async (routeName) => {
        const routename = routeName as string;
        const shouldScroll = [
            "course-create",
        ].includes(routename);

        if (!shouldScroll) return;

        await nextTick();

        routeContent.value?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    },
    { flush: "post" },
);

onMounted(async () => {
    try {
        await Promise.all([
            courseStore.fetchMyCourses(),
            organizationStore.fetchMyOrganization(),
        ]);
    } catch (err) {
        console.error("Failed to load dashboard:", err);
    }
});

function goToOrganizationSettings() {
    router.push({ name: "organization-settings" });
}

function goToProfile() {
    router.push({ name: "instructor.profile" });
}

async function refreshDashboard() {
    try {
        await Promise.all([
            courseStore.fetchMyCourses(),
            organizationStore.fetchMyOrganization(),
        ]);
    } catch (err) {
        console.error("Failed to update dashboard:", err);
    }
}
</script>

<template>
    <div class="mx-auto space-y-8 py-8">
        <!-- Dashboard header dan organization card -->
        <!-- HEADER -->
        <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
                <p class="text-[18px] font-bold text-primary">
                    Lingua Admin
                </p>

                <h1 class="mt-1 text-[38px] font-black text-text-primary">
                    Dashboard
                </h1>

                <p class="mt-2 text-[14px] text-text-secondary">
                    Manage your course operational and organization in one place.
                </p>
            </div>


            <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
                <CustomButton @click="goToProfile" variant="outline">
                    <User :size="18" />

                    My Profile
                </CustomButton>

                <CustomButton @click="refreshDashboard" variant="accent">{{ loading ? "Loading..." : "Refresh data" }}
                </CustomButton>
            </div>

        </header>

        <!-- ORGANIZATION -->
        <section class="rounded-2xl border border-text-primary bg-accent p-6 sm:p-8">
            <div class="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                <div>
                    <p class="text-[16px] font-semibold text-text-primary">
                        Your Organization
                    </p>

                    <h2 class="mt-2 text-[30px] font-black text-text-primary">
                        {{ organization?.name || "Lingua Organization" }}
                    </h2>

                    <p class="mt-2 max-w-xl text-[14px] leading-6 text-text-primary">
                        Manage organization or course information and oversee courses
                        in your organization.
                    </p>
                </div>

                <CustomButton @click="goToOrganizationSettings" variant="outline"
                    class="text-text-primary border border-text-primary cursor-pointer transition-all duration-300 ease-in-out">
                    Organization Setting
                </CustomButton>
            </div>
        </section>

        <h1 class="text-[30px] font-black">Recent All Enrollments</h1>
        <EnrollmentsOverviewSection />

        <AdminDashboardCourseSection v-if="route.name === 'dashboard'" />

        <div ref="routeContent" class="scroll-mt-2">
            <RouterView />
        </div>
    </div>
</template>