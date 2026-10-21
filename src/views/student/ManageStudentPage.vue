<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
    ArrowLeft,
    Users,
    Phone,
    School,
    CalendarDays,
    CircleAlert,
    RefreshCw,
    GraduationCap,
} from '@lucide/vue'

import { useCourseStores } from '@/stores/course_stores'
import { useEnrollmentStores } from '@/stores/enrollments_stores'

const route = useRoute()
const router = useRouter()

const courseStore = useCourseStores()
const enrollmentStore = useEnrollmentStores()

// Local UI state
const course = ref(null)
const enrollments = ref([])
const loading = ref(false)
const error = ref(null)

const courseId = computed(() => route.params.courseId)

const students = computed(() =>
    enrollments.value.filter((enrollment) =>
        ['approved', 'active'].includes(enrollment.status),
    ),
)

// Helpers
function getInitials(name) {
    if (!name?.trim()) return '?'

    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase()
}

function formatDate(date) {
    if (!date) return null

    const parsedDate = new Date(date)

    if (Number.isNaN(parsedDate.getTime())) return null

    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(parsedDate)
}

function statusClass(status) {
    return status === 'active'
        ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
        : 'bg-blue-50 text-blue-700 ring-blue-600/20'
}

function statusLabel(status) {
    return status === 'active' ? 'Active' : 'Approved'
}

// Data loading
async function fetchStudents() {
    if (!courseId.value) {
        error.value = 'Course ID tidak ditemukan pada URL.'
        return
    }

    loading.value = true
    error.value = null

    try {
        const courseData = await courseStore.fetchCourseById(
            courseId.value,
        )

        course.value = courseData?.data ?? courseData ?? null

        if (!course.value) {
            throw new Error('Data course tidak ditemukan.')
        }

        const enrollmentData =
            await enrollmentStore.fetchApprovedStudentByCourseId(
                courseId.value,
            )

        enrollments.value = Array.isArray(enrollmentData)
            ? enrollmentData
            : enrollmentData?.data ?? []
    } catch (err) {
        console.error('Failed to load course students:', err)

        error.value =
            err?.message ?? 'Gagal memuat data siswa. Silakan coba lagi.'
    } finally {
        loading.value = false
    }
}

function goBack() {
    router.back()
}

onMounted(fetchStudents)

watch(courseId, (newId, oldId) => {
    if (newId && newId !== oldId) {
        course.value = null
        enrollments.value = []
        fetchStudents()
    }
})
</script>

<template>
    <main class="min-h-screen bg-slate-50">
        <div class="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
            <!-- Page header -->
            <header class="flex items-center gap-3">
                <button type="button" aria-label="Back" class="rounded-xl border border-slate-200 bg-white p-2.5
                 text-slate-600 transition hover:bg-slate-100" @click="goBack">
                    <ArrowLeft class="size-5" />
                </button>

                <div class="flex size-11 shrink-0 items-center justify-center
                 rounded-xl bg-sky-100 text-sky-700">
                    <GraduationCap class="size-6" />
                </div>

                <div>
                    <h1 class="text-xl font-bold tracking-tight text-slate-900">
                        Manage Students
                    </h1>

                    <p class="mt-0.5 text-sm text-slate-500">
                        Manage students in this course.
                    </p>
                </div>
            </header>

            <!-- Course information -->
            <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm
               sm:p-6">
                <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Course
                </p>

                <template v-if="course">
                    <h2 class="mt-2 text-2xl font-bold text-slate-900">
                        {{ course.name }}
                    </h2>

                    <p class="mt-2 text-sm leading-6 text-slate-500">
                        Manage students enrolled in this course.
                    </p>
                </template>

                <div v-else class="mt-3 space-y-2">
                    <div class="h-7 w-2/3 animate-pulse rounded bg-slate-200" />
                    <div class="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
                </div>
            </section>

            <!-- Students -->
            <section class="space-y-4">
                <div class="flex items-center justify-between gap-3">
                    <div class="flex items-center gap-2.5">
                        <Users class="size-5 text-slate-600" />

                        <h2 class="text-lg font-bold text-slate-900">
                            Students
                        </h2>

                        <span class="rounded-full bg-blue-50 px-2.5 py-1
                     text-xs font-semibold text-blue-700">
                            {{ students.length }}
                        </span>
                    </div>
                </div>

                <!-- Loading -->
                <div v-if="loading" class="grid grid-cols-1 gap-3 xl:grid-cols-2" aria-label="Loading students">
                    <div v-for="item in 4" :key="item" class="rounded-2xl border border-slate-200 bg-white p-5">
                        <div class="flex animate-pulse items-center gap-3">
                            <div class="size-12 rounded-full bg-slate-200" />

                            <div class="flex-1 space-y-2">
                                <div class="h-4 w-40 rounded bg-slate-200" />
                                <div class="h-3 w-28 rounded bg-slate-100" />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Error -->
                <div v-else-if="error" class="rounded-2xl border border-red-200 bg-white p-6 text-center">
                    <CircleAlert class="mx-auto size-9 text-red-500" />

                    <h3 class="mt-3 font-semibold text-slate-900">
                        Can't load student data
                    </h3>

                    <p class="mt-1 text-sm text-slate-500">
                        {{ error }}
                    </p>

                    <button type="button" class="mt-4 inline-flex items-center gap-2 rounded-xl
                   bg-slate-900 px-4 py-2.5 text-sm font-semibold
                   text-white transition hover:bg-slate-700" @click="fetchStudents">
                        <RefreshCw class="size-4" />
                        Try again
                    </button>
                </div>

                <!-- Empty state -->
                <div v-else-if="students.length === 0" class="rounded-2xl border border-dashed border-slate-300
                 bg-white px-5 py-14 text-center">
                    <div class="mx-auto flex size-14 items-center justify-center
                   rounded-2xl bg-slate-100 text-slate-500">
                        <Users class="size-7" />
                    </div>

                    <h3 class="mt-4 font-semibold text-slate-900">
                        No students yet
                    </h3>

                    <p class="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">
                        Students approved for this course will appear here.
                    </p>
                </div>

                <!-- Student cards -->
                <div v-else class="grid grid-cols-1 gap-3 xl:grid-cols-2">
                    <article v-for="enrollment in students" :key="enrollment.id" class="rounded-2xl border border-slate-200 bg-white p-5
                   shadow-sm transition hover:border-slate-300 hover:shadow-md">
                        <div class="flex items-start gap-3">
                            <!-- Avatar -->
                            <div class="flex size-12 shrink-0 items-center justify-center
                       rounded-full bg-indigo-50 text-sm font-bold
                       text-indigo-700">
                                {{ getInitials(enrollment.fullname) }}
                            </div>

                            <!-- Student information -->
                            <div class="min-w-0 flex-1">
                                <div class="flex flex-wrap items-start justify-between gap-2">
                                    <h3 class="wrap-break-word font-semibold text-slate-900">
                                        {{ enrollment.fullname || 'Unnamed student' }}
                                    </h3>

                                    <span class="inline-flex shrink-0 rounded-full px-2.5 py-1
                           text-xs font-semibold ring-1 ring-inset" :class="statusClass(enrollment.status)">
                                        {{ statusLabel(enrollment.status) }}
                                    </span>
                                </div>

                                <div class="mt-3 space-y-2 text-sm text-slate-500">
                                    <p v-if="enrollment.phone" class="flex items-center gap-2">
                                        <Phone class="size-4 shrink-0" />
                                        <span class="break-all">{{ enrollment.phone }}</span>
                                    </p>

                                    <p v-if="enrollment.school_name" class="flex items-center gap-2">
                                        <School class="size-4 shrink-0" />
                                        <span class="wrap-break-word">
                                            {{ enrollment.school_name }}
                                        </span>
                                    </p>

                                    <p v-if="enrollment.education_level" class="flex items-center gap-2">
                                        <GraduationCap class="size-4 shrink-0" />
                                        <span>{{ enrollment.education_level }}</span>
                                    </p>

                                    <p v-if="enrollment.approved_at || enrollment.enrolled_at"
                                        class="flex items-center gap-2">
                                        <CalendarDays class="size-4 shrink-0" />
                                        <span>
                                            {{
                                                formatDate(
                                                    enrollment.approved_at ||
                                                    enrollment.enrolled_at,
                                            )
                                            }}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </article>
                </div>
            </section>
        </div>
    </main>
</template>