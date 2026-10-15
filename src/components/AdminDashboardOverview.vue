<script setup>
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

const router = useRouter();
const route = useRoute();

const courseStore = useCourseStores();
const organizationStore = useOrganizationStore();

const loading = computed(() => courseStore.loading);
const organization = computed(() => organizationStore.organization);

const routeContent = ref(null);

watch(
    () => route.name,
    async (routeName) => {
        const shouldScroll = [
            "course-create",
        ].includes(routeName);

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
    router.push({ name: "profile" });
}
</script>

<template>
    <div class="mx-auto max-w-7xl space-y-8 py-8">
        <!-- Dashboard header dan organization card -->
        <!-- HEADER -->
        <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
                <p class="text-sm font-medium text-slate-500">
                    Lingua Admin
                </p>

                <h1 class="mt-1 text-3xl font-bold text-dark-background">
                    Dashboard
                </h1>

                <p class="mt-2 text-sm text-slate-500">
                    Manage your course operational and organization in one place.
                </p>
            </div>


            <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button type="button" class="inline-flex items-center justify-center gap-2 rounded-xl
               border border-slate-300 bg-white px-4 py-2.5
               text-sm font-semibold text-dark-background/80
               transition duration-300 hover:bg-slate-100" @click="goToProfile">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="8" r="4" />
                        <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
                    </svg>

                    My Profile
                </button>

                <button type="button" class="rounded-xl border border-slate-500 bg-white px-4 py-2.5
               text-sm font-semibold text-dark-background/80
               transition duration-300 hover:bg-slate-100
               disabled:opacity-50" :disabled="loading" @click="refreshDashboard">
                    {{ loading ? "Loading..." : "Refresh data" }}
                </button>
            </div>

        </header>

        <!-- ORGANIZATION -->
        <section class="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-6 sm:p-8">
            <div class="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                <div>
                    <p class="text-sm font-semibold text-indigo-700">
                        Your Organization
                    </p>

                    <h2 class="mt-2 text-xl font-bold text-dark-background">
                        {{ organization?.name || "Lingua Organization" }}
                    </h2>

                    <p class="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                        Manage organization or course information and oversee courses
                        in your organization.
                    </p>
                </div>

                <button type="button" class="shrink-0 rounded-xl bg-indigo-600 px-5 py-3
                 text-sm font-semibold text-white hover:bg-indigo-700" @click="goToOrganizationSettings">
                    Organization Setting
                </button>
            </div>
        </section>

        <AdminDashboardCourseSection v-if="route.name === 'dashboard'" />

        <div ref="routeContent" class="scroll-mt-2">
            <RouterView />
        </div>
    </div>
</template>