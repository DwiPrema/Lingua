<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
    ArrowLeft,
    BookOpen,
    MapPin,
    Users,
    Layers,
    GraduationCap,
    Plus,
    Pencil,
    Trash2,
    Building2,
    ClipboardList,
    ChevronRight,
    RefreshCw,
} from "@lucide/vue";

import { useCourseStores } from "@/stores/course_stores";

const route = useRoute();
const router = useRouter();
const courseStore = useCourseStores();

const course = ref(null);
const isLoading = ref(false);
const pageError = ref("");
const notice = ref("");

const courseId = computed(() => route.params.courseId);

const courseName = computed(() => course.value?.name ?? "Course Detail");
const courseDescription = computed(
    () => course.value?.description || "No description available.",
);
const courseAddress = computed(
    () => course.value?.address || "No address provided.",
);

// Belum terhubung ke data enrollment dan classes.
const overview = computed(() => [
    {
        label: "Students",
        value: "—",
        description: "Enrolled students",
        icon: Users,
    },
    {
        label: "Programs",
        value: "—",
        description: "Available programs",
        icon: Layers,
    },
    {
        label: "Classes",
        value: "—",
        description: "Course classes",
        icon: GraduationCap,
    },
]);

async function loadCourse() {
    if (!courseId.value) {
        pageError.value = "Course ID is missing.";
        return;
    }

    isLoading.value = true;
    pageError.value = "";
    notice.value = "";

    try {
        course.value = await courseStore.fetchCourseById(courseId.value);
    } catch (error) {
        pageError.value = error?.message ?? "Failed to load course details.";
    } finally {
        isLoading.value = false;
    }
}

function goBack() {
    router.push({ name: "dashboard" });
}

function editCourse() {
    router.push({
        name: "course-edit",
        params: { courseId: courseId.value },
    });
}

function showComingSoon(feature) {
    notice.value = `${feature} management is not connected yet.`;
}

onMounted(loadCourse);

watch(courseId, loadCourse);
</script>

<template>
    <main class="min-h-screen bg-slate-50 text-slate-800">
        <div class="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:px-8">
            <!-- Top navigation -->
            <header class="flex items-center justify-between gap-4">
                <button type="button" class="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm
                 font-semibold text-slate-600 transition hover:bg-white
                 hover:text-slate-900" @click="goBack">
                    <ArrowLeft class="h-4 w-4" />
                    Back to Dashboard
                </button>

                <button type="button" class="inline-flex items-center gap-2 rounded-xl border border-slate-200
                 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700
                 transition hover:border-indigo-300 hover:text-indigo-700" :disabled="isLoading" @click="loadCourse">
                    <RefreshCw class="h-4 w-4" />
                    Refresh
                </button>
            </header>

            <!-- Loading state -->
            <section v-if="isLoading && !course" class="animate-pulse space-y-6">
                <div class="h-64 rounded-3xl bg-slate-200"></div>
                <div class="grid gap-4 sm:grid-cols-3">
                    <div v-for="item in 3" :key="item" class="h-28 rounded-2xl bg-slate-200"></div>
                </div>
                <div class="h-48 rounded-2xl bg-slate-200"></div>
            </section>

            <!-- Error state -->
            <section v-else-if="pageError && !course"
                class="rounded-3xl border border-red-200 bg-white px-6 py-12 text-center">
                <div class="mx-auto flex h-14 w-14 items-center justify-center
                 rounded-2xl bg-red-50 text-red-600">
                    <BookOpen class="h-7 w-7" />
                </div>

                <h1 class="mt-4 text-xl font-bold text-slate-900">
                    Unable to load course
                </h1>

                <p class="mx-auto mt-2 max-w-lg text-sm text-slate-500">
                    {{ pageError }}
                </p>

                <button type="button" class="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm
                 font-semibold text-white hover:bg-indigo-700" @click="loadCourse">
                    Try again
                </button>
            </section>

            <template v-else-if="course">
                <!-- Course hero -->
                <section class="relative overflow-hidden rounded-3xl bg-linear-to-br
                 from-indigo-700 via-indigo-600 to-violet-600 p-6 text-white
                 shadow-lg shadow-indigo-900/10 sm:p-10">
                    <div class="pointer-events-none absolute -right-16 -top-20
                   h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>

                    <div class="pointer-events-none absolute -bottom-24 right-1/3
                   h-48 w-48 rounded-full bg-violet-300/20 blur-3xl"></div>

                    <div class="relative flex flex-col gap-8 lg:flex-row lg:items-end
                      lg:justify-between">
                        <div class="max-w-3xl">
                            <div class="flex h-14 w-14 items-center justify-center
                       rounded-2xl border border-white/20 bg-white/15">
                                <BookOpen class="h-7 w-7" />
                            </div>

                            <p class="mt-6 text-xs font-bold uppercase tracking-[0.2em]
                       text-indigo-100">
                                Course Management
                            </p>

                            <h1 class="mt-3 wrap-break-word text-3xl font-extrabold
                         tracking-tight sm:text-4xl lg:text-5xl">
                                {{ courseName }}
                            </h1>

                            <p class="mt-4 max-w-2xl whitespace-pre-line text-sm
                        leading-7 text-indigo-100 sm:text-base">
                                {{ courseDescription }}
                            </p>

                            <div class="mt-6 flex items-start gap-2 text-sm text-indigo-100">
                                <MapPin class="mt-0.5 h-5 w-5 shrink-0" />
                                <span>{{ courseAddress }}</span>
                            </div>
                        </div>

                        <button type="button" class="inline-flex shrink-0 items-center justify-center gap-2
                     rounded-xl bg-white px-5 py-3 text-sm font-bold
                     text-indigo-700 shadow-sm transition hover:bg-indigo-50" @click="editCourse">
                            <Pencil class="h-4 w-4" />
                            Edit Course
                        </button>
                    </div>
                </section>

                <!-- Inline notice -->
                <div v-if="notice" class="flex items-center justify-between gap-3 rounded-xl
                 border border-amber-200 bg-amber-50 px-4 py-3
                 text-sm text-amber-800">
                    <span>{{ notice }}</span>
                    <button type="button" class="font-semibold underline" @click="notice = ''">
                        Dismiss
                    </button>
                </div>

                <!-- Overview -->
                <section>
                    <div class="mb-4">
                        <h2 class="text-xl font-bold tracking-tight text-slate-900">
                            Overview
                        </h2>
                        <p class="mt-1 text-sm text-slate-500">
                            A quick summary of your course.
                        </p>
                    </div>

                    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        <article v-for="item in overview" :key="item.label" class="rounded-2xl border border-slate-200/80 bg-white p-5
                     shadow-sm shadow-slate-900/2">
                            <div class="flex items-start justify-between">
                                <div>
                                    <p class="text-sm font-medium text-slate-500">
                                        {{ item.label }}
                                    </p>
                                    <p class="mt-3 text-3xl font-extrabold text-slate-900">
                                        {{ item.value }}
                                    </p>
                                    <p class="mt-1 text-xs text-slate-400">
                                        {{ item.description }}
                                    </p>
                                </div>

                                <div class="flex h-11 w-11 items-center justify-center
                         rounded-xl bg-indigo-50 text-indigo-600">
                                    <component :is="item.icon" class="h-5 w-5" />
                                </div>
                            </div>
                        </article>
                    </div>
                </section>

                <!-- Programs -->
                <section class="rounded-2xl border border-slate-200/80 bg-white p-5
                 shadow-sm shadow-slate-900/2 sm:p-6">
                    <div class="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h2 class="text-xl font-bold text-slate-900">Programs</h2>
                            <p class="mt-1 text-sm text-slate-500">
                                Organize different learning programs for this course.
                            </p>
                        </div>

                        <button type="button" class="inline-flex items-center gap-2 rounded-xl bg-indigo-600
                     px-4 py-2.5 text-sm font-semibold text-white
                     transition hover:bg-indigo-700" @click="showComingSoon('Program')">
                            <Plus class="h-4 w-4" />
                            Add Program
                        </button>
                    </div>

                    <div class="mt-6 rounded-2xl border border-dashed border-slate-300
                      bg-slate-50/70 px-5 py-10 text-center">
                        <div class="mx-auto flex h-12 w-12 items-center justify-center
                     rounded-2xl bg-white text-slate-500 shadow-sm">
                            <Layers class="h-6 w-6" />
                        </div>

                        <h3 class="mt-4 font-bold text-slate-900">No programs displayed</h3>
                        <p class="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                            Programs such as Regular, Private, or Intensive will appear here
                            once program data is connected.
                        </p>

                        <button type="button" class="mt-5 inline-flex items-center gap-2 rounded-xl border
                     border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold
                     text-slate-700 hover:border-indigo-300 hover:text-indigo-700" @click="showComingSoon('Program')">
                            <Plus class="h-4 w-4" />
                            Create your first program
                        </button>
                    </div>
                </section>

                <!-- Classes -->
                <section class="rounded-2xl border border-slate-200/80 bg-white p-5
                 shadow-sm shadow-slate-900/2 sm:p-6">
                    <div class="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h2 class="text-xl font-bold text-slate-900">Classes</h2>
                            <p class="mt-1 text-sm text-slate-500">
                                Manage class groups and their learning schedules.
                            </p>
                        </div>

                        <button type="button" class="inline-flex items-center gap-2 rounded-xl border
                     border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold
                     text-slate-700 hover:border-indigo-300 hover:text-indigo-700" @click="showComingSoon('Class')">
                            <Plus class="h-4 w-4" />
                            Add Class
                        </button>
                    </div>

                    <div class="mt-6 flex flex-col items-center rounded-2xl
                      bg-slate-50 px-5 py-10 text-center">
                        <div class="flex h-12 w-12 items-center justify-center
                     rounded-2xl bg-white text-slate-500 shadow-sm">
                            <GraduationCap class="h-6 w-6" />
                        </div>

                        <h3 class="mt-4 font-bold text-slate-900">No classes displayed</h3>
                        <p class="mt-2 max-w-md text-sm leading-6 text-slate-500">
                            Your classes and schedules will be displayed here when the
                            class-management feature is available.
                        </p>
                    </div>
                </section>

                <!-- Management -->
                <section>
                    <div class="mb-4">
                        <h2 class="text-xl font-bold text-slate-900">Management</h2>
                        <p class="mt-1 text-sm text-slate-500">
                            Shortcuts to manage your course.
                        </p>
                    </div>

                    <div class="grid gap-4 md:grid-cols-2">
                        <button type="button" class="group flex items-center gap-4 rounded-2xl border
                     border-slate-200/80 bg-white p-5 text-left shadow-sm
                     transition hover:-translate-y-0.5 hover:border-indigo-300
                     hover:shadow-md" @click="showComingSoon('Student')">
                            <div class="flex h-12 w-12 shrink-0 items-center justify-center
                       rounded-xl bg-blue-50 text-blue-600">
                                <Users class="h-6 w-6" />
                            </div>

                            <div class="min-w-0 flex-1">
                                <h3 class="font-bold text-slate-900">Manage Students</h3>
                                <p class="mt-1 text-sm leading-5 text-slate-500">
                                    View and manage students enrolled in this course.
                                </p>
                            </div>

                            <ChevronRight class="h-5 w-5 shrink-0 text-slate-400
                       transition group-hover:translate-x-1
                       group-hover:text-indigo-600" />
                        </button>

                        <button type="button" class="group flex items-center gap-4 rounded-2xl border
                     border-slate-200/80 bg-white p-5 text-left shadow-sm
                     transition hover:-translate-y-0.5 hover:border-indigo-300
                     hover:shadow-md" @click="showComingSoon('Enrollment')">
                            <div class="flex h-12 w-12 shrink-0 items-center justify-center
                       rounded-xl bg-amber-50 text-amber-600">
                                <ClipboardList class="h-6 w-6" />
                            </div>

                            <div class="min-w-0 flex-1">
                                <h3 class="font-bold text-slate-900">Manage Enrollments</h3>
                                <p class="mt-1 text-sm leading-5 text-slate-500">
                                    Review and manage student enrollment requests.
                                </p>
                            </div>

                            <ChevronRight class="h-5 w-5 shrink-0 text-slate-400
                       transition group-hover:translate-x-1
                       group-hover:text-indigo-600" />
                        </button>

                        <div class="flex items-center gap-4 rounded-2xl border
                     border-slate-200/80 bg-white p-5 shadow-sm md:col-span-2">
                            <div class="flex h-12 w-12 shrink-0 items-center justify-center
                       rounded-xl bg-violet-50 text-violet-600">
                                <Building2 class="h-6 w-6" />
                            </div>

                            <div class="min-w-0 flex-1">
                                <h3 class="font-bold text-slate-900">Course Information</h3>
                                <p class="mt-1 text-sm leading-5 text-slate-500">
                                    Update your course name, description, and address.
                                </p>
                            </div>

                            <button type="button" class="inline-flex shrink-0 items-center gap-2 rounded-xl
                       border border-slate-200 px-3 py-2 text-sm font-semibold
                       text-slate-700 hover:border-indigo-300 hover:text-indigo-700" @click="editCourse">
                                <Pencil class="h-4 w-4" />
                                Edit
                            </button>
                        </div>
                    </div>
                </section>
            </template>
        </div>
    </main>
</template>
