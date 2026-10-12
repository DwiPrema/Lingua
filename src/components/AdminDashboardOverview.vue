<script setup>
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";

import { useCourseStores } from "@/stores/course_stores";
import { useOrganizationStore } from "@/stores/organization_stores";

const router = useRouter();

const courseStore = useCourseStores();
const organizationStore = useOrganizationStore();

const courses = computed(() => courseStore.courses);
const loading = computed(() => courseStore.loading);
const error = computed(() => courseStore.error);

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

function goToCreateCourse() {
    router.push({ name: "course-create" });
}

function goToOrganizationSettings() {
    router.push({ name: "organization-settings" });
}

function goToCourseDetail(courseId) {
    router.push({
        name: "course-detail",
        params: { courseId },
    });
}

function goToEditCourse(courseId) {
    router.push({
        name: "course-edit",
        params: { courseId },
    });
}

async function handleDeleteCourse(course) {
    const confirmed = window.confirm(
        `Are you sure to delete this course: "${course.name}"?`
    );

    if (!confirmed) return;

    try {
        await courseStore.deleteCourse(course.id);
    } catch (err) {
        console.error("Failed to delete this course:", err);
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

        <!-- COURSE SECTION HEADER -->
        <section>
            <div class="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h2 class="text-xl font-bold text-dark-background">
                        My Courses
                    </h2>

                    <p class="mt-1 text-sm text-slate-500">
                        Manage the courses you have created.
                    </p>
                </div>

                <button type="button" class="rounded-xl bg-indigo-600 px-5 py-3
                   text-sm font-semibold text-white
                   hover:bg-indigo-700" @click="goToCreateCourse">
                    + Add Course
                </button>
            </div>

            <!-- LOADING -->
            <div v-if="loading && courses.length === 0"
                class="rounded-2xl border border-slate-200 bg-white p-12 text-center">
                <div class="mx-auto h-8 w-8 animate-spin rounded-full
                   border-4 border-slate-200 border-t-indigo-600"></div>

                <p class="mt-4 text-sm text-slate-500">
                    Loading Course Data...
                </p>
            </div>

            <!-- ERROR -->
            <div v-else-if="error && courses.length === 0"
                class="rounded-2xl border border-red-200 bg-white p-8 text-center">
                <h3 class="font-semibold text-red-700">
                    Failed to load courses
                </h3>

                <p class="mt-2 text-sm text-slate-500">
                    {{ error }}
                </p>

                <button type="button" class="mt-5 rounded-xl bg-red-600 px-4 py-2.5
                   text-sm font-semibold text-white
                   hover:bg-red-700" @click="refreshDashboard">
                    Try Again
                </button>
            </div>

            <!-- EMPTY STATE -->
            <div v-else-if="courses.length === 0" class="rounded-2xl border border-dashed border-slate-300
                 bg-white px-6 py-16 text-center">
                <div class="mx-auto flex h-14 w-14 items-center justify-center
                   rounded-2xl bg-indigo-50 text-2xl">
                    📚
                </div>

                <h3 class="mt-5 text-lg font-bold text-dark-background">
                    You don't have any courses yet.
                </h3>

                <p class="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                    Let's add your first course to manage information and course activity on Lingua.
                </p>

                <button type="button" class="mt-6 rounded-xl bg-indigo-600 px-5 py-3
                   text-sm font-semibold text-white
                   hover:bg-indigo-700" @click="goToCreateCourse">
                    Add First Course
                </button>
            </div>

            <!-- COURSE LIST -->
            <div v-else class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                <article v-for="course in courses" :key="course.id" class="flex flex-col rounded-2xl border border-slate-200
                   bg-white p-5 shadow-sm transition
                   hover:-translate-y-0.5 hover:shadow-md">
                    <div class="flex-1">
                        <div class="flex h-11 w-11 items-center justify-center
                       rounded-xl bg-indigo-50 text-xl">
                            📖
                        </div>

                        <h3 class="mt-4 text-lg font-bold text-dark-background">
                            {{ course.name }}
                        </h3>

                        <p class="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                            {{ course.description || "No description yet." }}
                        </p>

                        <p class="mt-4 text-xs text-slate-500">
                            {{ course.address || "Address doesn't available" }}
                        </p>
                    </div>

                    <div class="mt-6 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                        <button type="button" class="rounded-lg bg-indigo-50 px-3 py-2
                       text-sm font-semibold text-indigo-700
                       hover:bg-indigo-100" @click="goToCourseDetail(course.id)">
                            Detail
                        </button>

                        <button type="button" class="rounded-lg bg-slate-100 px-3 py-2
                       text-sm font-semibold text-slate-700
                       hover:bg-slate-200" @click="goToEditCourse(course.id)">
                            Edit
                        </button>

                        <button type="button" class="rounded-lg bg-red-50 px-3 py-2
                       text-sm font-semibold text-red-700
                       hover:bg-red-100" @click="handleDeleteCourse(course)">
                            Hapus
                        </button>
                    </div>
                </article>
            </div>

            <!-- ERROR WHEN STALE DATA EXISTS -->
            <p v-if="error && courses.length > 0" class="mt-4 text-sm text-red-600" role="alert">
                Update data failed: {{ error }}
            </p>
        </section>
    </div>
</template>