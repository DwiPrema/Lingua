<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";

import { useCourseStores } from "@/stores/course_stores";
import { Edit, MapPin, Trash } from "@lucide/vue";
import { useOrganizationStore } from "@/stores/organization_stores";
import { Course } from "@/types/course_type";
import CustomButton from "@/components/CustomButton.vue";

const router = useRouter();

const courseStore = useCourseStores();
const organizationStore = useOrganizationStore();

const courses = computed(() => courseStore.courses);
const error = computed(() => courseStore.error);
const loading = computed(() => courseStore.loading);

function goToCreateCourse() {
    router.push({ name: "course-create" });
}

function goToEditCourse(courseId: string) {
    router.push({
        name: "course-edit",
        params: { courseId },
    });
}

function goToCourseDetail(courseId: string) {
    router.push({
        name: "course-detail",
        params: { courseId },
    });
}

async function handleDeleteCourse(course: Course) {
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
    <!-- COURSE SECTION HEADER -->
    <section>
        <div class="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
                <h2 class="text-[30px] font-black text-primary">
                    My Courses
                </h2>

                <p class="mt-1 text-[14px] text-text-secondary">
                    Manage the courses you have created.
                </p>
            </div>

            <CustomButton @click="goToCreateCourse">+ Add Course</CustomButton>
        </div>

        <!-- LOADING -->
        <div v-if="loading && courses.length === 0"
            class="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <div class="mx-auto h-8 w-8 animate-spin rounded-full
                   border-4 border-slate-200 border-t-accent"></div>

            <p class="mt-4 text-[14px] text-text-secondary">
                Loading Course Data...
            </p>
        </div>

        <!-- ERROR -->
        <div v-else-if="error && courses.length === 0"
            class="rounded-2xl border border-red-200 bg-white p-8 text-center">
            <h3 class="font-semibold text-alert">
                Failed to load courses
            </h3>

            <p class="mt-2 text-[14px] text-text-secondary">
                {{ error }}
            </p>

            <button type="button" class="mt-5 rounded-xl bg-alert/85 px-4 py-2.5
                   text-[14px] font-semibold text-white
                   hover:bg-alert" @click="refreshDashboard">
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

            <h3 class="mt-5 text-lg font-bold text-text-primary">
                You don't have any courses yet.
            </h3>

            <p class="mx-auto mt-2 max-w-sm text-[14px] leading-6 text-text-secondary">
                Let's add your first course to manage information and course activity on Lingua.
            </p>

            <CustomButton @click="goToCreateCourse">Add First Course</CustomButton>
        </div>

        <!-- COURSE LIST -->
        <div v-else class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <article v-for="course in courses" :key="course.id" class="flex flex-col rounded-2xl border border-text-primary
                   bg-white p-5 shadow-sm transition
                   hover:-translate-y-0.5 hover:shadow-md">
                <div class="flex-1">
                    <h3 class="text-[20px] font-black text-text-primary">
                        {{ course.name }}
                    </h3>

                    <p class="line-clamp-3 text-[14px] leading-6 text-text-secondary">
                        {{ course.description || "No description yet." }}
                    </p>

                    <p class="mt-4 text-xs text-text-secondary flex flex-row items-center gap-1">
                        <MapPin :size="16" /> <span>{{ course.address || "Address doesn't available" }}</span>
                    </p>
                </div>

                <div class="mt-6 flex flex-wrap gap-2 border-t border-text-secondary pt-4 justify-between items-center">
                    <CustomButton size="sm" @click="goToCourseDetail(course.id)" variant="secondary" >Detail</CustomButton>

                    <div class="flex flex-row gap-2 items-center">
                        <button type="button" class="rounded-lg bg-text-primary/10 px-3 py-2
                       text-[14px] font-semibold text-text-primary
                       hover:bg-text-primary/20" @click="goToEditCourse(course.id)">
                            <Edit :size="16" />
                        </button>

                        <button type="button" class="rounded-lg bg-alert/10 px-3 py-2
                       text-[14px] font-semibold text-alert
                       hover:bg-alert/20 ease-in-out transition-all duration-300" @click="handleDeleteCourse(course)">
                            <Trash :size="16" />
                        </button>
                    </div>
                </div>
            </article>
        </div>

        <!-- ERROR WHEN STALE DATA EXISTS -->
        <p v-if="error && courses.length > 0" class="mt-4 text-[14px] text-alert/85" role="alert">
            Update data failed: {{ error }}
        </p>
    </section>
</template>