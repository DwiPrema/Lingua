<script setup lang="ts">
import { useAuthStore } from '@/stores/auth_stores';
import { formatCurrency } from '@/composables/format_currency'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCourseStores } from '@/stores/course_stores'
import { useCourseProgramStore } from '@/stores/course_program_stores'
import type { Course } from '@/types/course_type';
import "@/assets/grid.css";

const route = useRoute()
const router = useRouter()

const courseStore = useCourseStores()
const courseProgramStore = useCourseProgramStore()
const authStore = useAuthStore()

const course = ref<Course | null>(null)
const selectedProgramId = ref<string | null>(null)
const pageLoading = ref(false)
const pageError = ref<string | null>(null)

const programs = computed(
    () => courseProgramStore.coursePrograms ?? [],
)

const selectedProgram = computed(
    () =>
        programs.value.find(
            (program) => program.id === selectedProgramId.value,
        ) ?? null,
)

const loadCourseDetail = async () => {
    const courseId: string = route.params.id as string

    pageLoading.value = true
    pageError.value = null
    course.value = null
    selectedProgramId.value = null

    console.log(courseId)

    try {

        const courseData = await courseStore.fetchCourseById(courseId)

        if (!courseData) {
            throw new Error('Course details could not be found.')
        }

        course.value = courseData

        await courseProgramStore.getAllCourseProgram(courseId)
    } catch (error: unknown) {
        const err = error as { message?: string }
        pageError.value =
            err?.message || 'Something went wrong while loading the course.'
    } finally {
        pageLoading.value = false
    }
}

const selectProgram = (programId: string) => {
    selectedProgramId.value =
        selectedProgramId.value === programId ? null : programId
}

const continueToEnrollment = () => {
    if (!course.value || !selectedProgram.value) {
        return
    }

    router.push({
        name: 'student.enrollment-form',
        params: {
            courseId: course.value.id,
            programId: selectedProgram.value.id,
        },
    })
}


onMounted(async () => {
    loadCourseDetail()
})

watch(
    () => route.params.id,
    (newId, oldId) => {
        if (newId !== oldId) {
            loadCourseDetail()
        }
    },
)
</script>

<template>
    <main class="min-h-screen pb-16">
        <!-- Header -->
        <header class="border-b border-slate-200 bg-light-background top-0 sticky">
            <div class="mx-auto flex items-center justify-between
                       px-4 py-4 sm:px-6 lg:px-8">
                <button @click="router.back()" class="inline-flex items-center gap-2 text-[14px] font-medium
                           text-slate-600 transition hover:text-primary-hover">
                    <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m15 18-6-6 6-6" />
                    </svg>

                    Back
                </button>

                <span class="text-lg font-bold tracking-tight text-secondary">
                    Lingua
                </span>
            </div>
        </header>

        <!-- Loading State -->
        <section v-if="pageLoading" class="mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <div class="animate-pulse space-y-6">
                <div class="h-8 w-2/3 rounded-lg bg-slate-200" />
                <div class="h-4 w-full max-w-2xl rounded bg-slate-200" />
                <div class="h-4 w-1/2 rounded bg-slate-200" />

                <div class="grid gap-8 pt-6 lg:grid-cols-3">
                    <div class="space-y-4 lg:col-span-2">
                        <div class="h-48 rounded-2xl bg-slate-200" />
                        <div class="h-32 rounded-2xl bg-slate-200" />
                    </div>

                    <div class="h-64 rounded-2xl bg-slate-200" />
                </div>
            </div>
        </section>

        <!-- Error State -->
        <section v-else-if="pageError" class="mx-auto max-w-2xl px-4 py-20 text-center">
            <div class="mx-auto flex h-14 w-14 items-center justify-center
                       rounded-full bg-red-100 text-alert">
                <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" />
                    <path stroke-linecap="round" d="M12 8v4m0 4h.01" />
                </svg>
            </div>

            <h1 class="mt-5 text-xl font-bold text-text-primary">
                Unable to Load Course
            </h1>

            <p class="mt-2 text-[14px] leading-6 text-text-secondary">
                {{ pageError }}
            </p>

            <button type="button" class="mt-6 rounded-xl bg-primary px-5 py-3 text-[14px]
                       font-semibold text-white transition hover:bg-primary-hover" @click="loadCourseDetail">
                Try Again
            </button>
        </section>

        <!-- Course Details -->
        <template v-else-if="course">
            <section>
                <div class="mx-auto px-4 py-10 sm:px-6 lg:px-8">
                    <div class="max-w-3xl">
                        <div class="inline-flex items-center text-xs font-semibold
                                   text-secondary">
                            Course Details
                        </div>

                        <h1 class="mt-4 text-3xl font-bold tracking-tight
                                   text-text-primary sm:text-4xl">
                            {{ course.name }}
                        </h1>

                        <p class="mt-2 whitespace-pre-line text-base leading-7
                                   text-text-secondary">
                            {{
                                course.description ||
                                'No course description is available yet.'
                            }}
                        </p>

                        <div v-if="course.address" class="mt-5 flex items-start gap-2 text-[14px] text-text-secondary">
                            <svg class="mt-0.5 h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="1.8">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                                <circle cx="12" cy="10" r="2.5" />
                            </svg>

                            <span>{{ course.address }}</span>
                        </div>
                    </div>
                </div>
            </section>

            <div class="mx-auto grid gap-8 px-4 py-8
                       sm:px-6 lg:grid-cols-3 lg:px-8">
                <!-- Main Content -->
                <div class="space-y-8 lg:col-span-2">
                    <!-- About Course -->
                    <section class="rounded-2xl border border-text-primary bg-accent/80 p-6
                               sm:p-8">
                        <h2 class="text-xl font-bold text-text-primary">
                            About This Course
                        </h2>

                        <p class="mt-4 whitespace-pre-line text-[14px] leading-7
                                   text-slate-600">
                            {{
                                course.description ||
                                'Course information is not available yet.'
                            }}
                        </p>

                        <div v-if="course.address" class="mt-6 border-t border-text-primary pt-5">
                            <h3 class="text-[14px] font-semibold text-text-primary">
                                Course Location
                            </h3>

                            <p class="mt-2 text-[14px] text-slate-600">
                                {{ course.address }}
                            </p>
                        </div>
                    </section>

                    <!-- Available Programs -->
                    <section class="rounded-2xl border border-text-primary bg-surface p-6
                               sm:p-8">
                        <div class="flex flex-col gap-2 sm:flex-row
                                   sm:items-center sm:justify-between">
                            <div>
                                <h2 class="text-xl font-bold text-text-primary">
                                    Available Programs
                                </h2>

                                <p class="mt-1 text-[14px] text-text-secondary">
                                    Choose a program that matches your learning goals.
                                </p>
                            </div>

                            <span class="w-fit rounded-full bg-slate-100 px-3 py-1
                                       text-xs font-medium text-slate-600">
                                {{ programs.length }}
                                {{ programs.length === 1 ? 'program' : 'programs' }}
                            </span>
                        </div>

                        <!-- Program Loading -->
                        <div v-if="courseProgramStore.loading" class="mt-6 space-y-4">
                            <div v-for="n in 2" :key="n" class="h-32 animate-pulse rounded-xl bg-slate-100" />
                        </div>

                        <!-- Program Error -->
                        <div v-else-if="courseProgramStore.error"
                            class="mt-6 rounded-xl bg-red-50 p-4 text-[14px] text-alert">
                            Unable to load course programs. Please try again later.
                        </div>

                        <!-- No Programs -->
                        <div v-else-if="programs.length === 0" class="mt-6 rounded-xl border border-dashed
                                   border-slate-300 px-5 py-10 text-center">
                            <p class="font-medium text-slate-700">
                                No Programs Available
                            </p>

                            <p class="mt-2 text-[14px] text-text-secondary">
                                Please check back later for available programs.
                            </p>
                        </div>

                        <!-- Program List -->
                        <div v-else class="mt-6 space-y-4">
                            <button v-for="program in programs" :key="program.id" type="button" class="w-full rounded-xl border p-5 text-left
                                       transition" :class="selectedProgramId === program.id
                                        ? 'border-primary bg-indigo-50 ring-2 ring-indigo-100'
                                        : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                                        " :aria-pressed="selectedProgramId === program.id"
                                @click="selectProgram(program.id)">
                                <div class="flex items-start justify-between gap-4">
                                    <div class="min-w-0">
                                        <h3 class="font-semibold text-text-primary">
                                            {{ program.name }}
                                        </h3>

                                        <p class="mt-2 whitespace-pre-line
                                                   text-[14px] leading-6 text-slate-600">
                                            {{
                                                program.description ||
                                                'No program description is available yet.'
                                            }}
                                        </p>
                                    </div>

                                    <div class="flex h-5 w-5 shrink-0 items-center
                                               justify-center rounded-full border" :class="selectedProgramId === program.id
                                                ? 'border-primary bg-primary text-white'
                                                : 'border-slate-300 bg-white'
                                                ">
                                        <svg v-if="selectedProgramId === program.id" class="h-3 w-3" viewBox="0 0 24 24"
                                            fill="none" stroke="currentColor" stroke-width="3">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="m5 12 4 4L19 6" />
                                        </svg>
                                    </div>
                                </div>

                                <div class="mt-5 grid gap-3 border-t border-slate-200/70
                                           pt-4 sm:grid-cols-2">
                                    <div>
                                        <p class="text-xs text-text-secondary">
                                            Registration Fee
                                        </p>

                                        <p class="mt-1 font-semibold text-text-primary">
                                            {{
                                                formatCurrency(
                                                    program.registration_fee,
                                                )
                                            }}
                                        </p>
                                    </div>

                                    <div>
                                        <p class="text-xs text-text-secondary">
                                            Monthly Fee
                                        </p>

                                        <p class="mt-1 font-semibold text-text-primary">
                                            {{
                                                formatCurrency(
                                                    program.monthly_fee,
                                                )
                                            }}

                                            <span class="text-xs font-normal
                                                       text-text-secondary">
                                                / month
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </section>
                </div>

                <!-- Enrollment Sidebar -->
                <aside class="space-y-5">
                    <section class="sticky top-20 rounded-2xl border border-text-primary
                               bg-surface p-6 shadow-sm">
                        <h2 class="text-lg font-bold text-text-primary">
                            Join This Course
                        </h2>

                        <p class="mt-2 text-[14px] leading-6 text-text-secondary">
                            Select a program to review its fees before continuing.
                        </p>

                        <!-- Selected Program Summary -->
                        <div v-if="selectedProgram" class="mt-6 rounded-xl bg-indigo-50 p-4">
                            <p class="text-xs font-medium text-primary">
                                Selected Program
                            </p>

                            <p class="mt-1 font-semibold text-text-primary">
                                {{ selectedProgram.name }}
                            </p>

                            <div class="mt-4 space-y-3">
                                <div class="flex justify-between gap-3 text-[14px]">
                                    <span class="text-slate-600">
                                        Registration Fee
                                    </span>

                                    <span class="text-right font-medium text-text-primary">
                                        {{
                                            formatCurrency(
                                                selectedProgram.registration_fee,
                                            )
                                        }}
                                    </span>
                                </div>

                                <div class="flex justify-between gap-3 text-[14px]">
                                    <span class="text-slate-600">
                                        Monthly Fee
                                    </span>

                                    <span class="text-right font-medium text-text-primary">
                                        {{
                                            formatCurrency(
                                                selectedProgram.monthly_fee,
                                            )
                                        }}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- No Selection -->
                        <div v-else class="mt-6 rounded-xl border border-dashed
                                   border-slate-300 p-4 text-[14px] text-text-secondary">
                            No program selected yet.
                        </div>

                        <button type="button" class="mt-6 w-full rounded-xl px-5 py-3 text-[14px]
                                   font-semibold transition" :class="selectedProgram
                                    ? 'bg-secondary text-white hover:bg-primary'
                                    : 'cursor-not-allowed bg-slate-100 text-slate-400'
                                    " :disabled="!selectedProgram" @click="continueToEnrollment">
                            Continue to Enrollment
                        </button>

                        <p class="mt-3 text-center text-xs leading-5 text-text-secondary">
                            Please make sure your selected program meets
                            your learning needs before continuing.
                        </p>
                    </section>
                </aside>
            </div>
        </template>
    </main>
</template>