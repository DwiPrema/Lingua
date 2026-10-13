<script setup>
import { computed, onMounted } from "vue";
import { RouterView, useRoute, useRouter } from "vue-router";

import { useCourseStores } from "@/stores/course_stores";
import { useOrganizationStore } from "@/stores/organization_stores";
import AdminDashboardCourseSection from "./AdminDashboardCourseSection.vue";

const router = useRouter();
const route = useRoute();

const courseStore = useCourseStores();
const organizationStore = useOrganizationStore();

const loading = computed(() => courseStore.loading);

const organization = computed(
    () => organizationStore.organization
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
    <div class="mx-auto max-w-7xl space-y-8 py-8">
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

            <button type="button" class="rounded-xl border border-slate-500 bg-white px-4 py-2.5
                 text-sm font-semibold text-dark-background/80
                 hover:bg-slate-100 disabled:opacity-50 duration-300 transition-all ease-in-out" :disabled="loading"
                @click="refreshDashboard">
                {{ loading ? "Loading..." : "Refresh data" }}
            </button>
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
                        Manage organization or course information and oversee courses in your organization.
                    </p>
                </div>

                <button type="button" class="shrink-0 rounded-xl bg-indigo-600 px-5 py-3
                   text-sm font-semibold text-white
                   hover:bg-indigo-700" @click="goToOrganizationSettings">
                    Organization Setting
                </button>
            </div>
        </section>

        <AdminDashboardCourseSection v-if="route.name === 'dashboard'"/>

        <RouterView />
    </div>
</template>