
<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { useEnrollmentStores } from '@/stores/enrollments_stores'
import { useAuthStore } from '@/stores/auth_stores'

import {
    AlertCircle,
    ArrowUpRight,
    BookOpen,
    CalendarDays,
    CheckCircle2,
    CircleAlert,
    Clock3,
    GraduationCap,
    Layers,
} from '@lucide/vue'

import type { Enrollment, StatusEnrollmentType } from '@/types/enrollment_type'
import type { Course } from '@/types/course_type'
import type { Programs } from '@/types/program_type'
import CustomButton from '@/components/CustomButton.vue'

// =====================================================
// TYPES
// =====================================================

type EnrollmentFilterStatus = 'all' | StatusEnrollmentType | 'cancelled'

interface EnrollmentListItem extends Enrollment {
    course?: Pick<Course, 'name'> | null
    program?: Pick<Programs, 'name'> | null
}

// =====================================================
// ROUTER & STORES
// =====================================================

const router = useRouter()

const enrollmentStore = useEnrollmentStores()
const authStore = useAuthStore()

// =====================================================
// STATE
// =====================================================

const searchQuery = ref<string>('')
const selectedStatus = ref<EnrollmentFilterStatus>('all')

// =====================================================
// STATUS OPTIONS
// =====================================================

const statusOptions = [
    { label: 'All Enrollments', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Active', value: 'active' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Cancelled', value: 'cancelled' },
] satisfies {
    label: string
    value: EnrollmentFilterStatus
}[]

const studentId = computed<string | null>(
    () => authStore.user?.id ?? authStore.session?.user?.id ?? null,
)

const enrollments = computed<EnrollmentListItem[]>(
    () => enrollmentStore.enrollments,
)

const loading = computed<boolean>(
    () => enrollmentStore.loading,
)

const error = computed(
    () => enrollmentStore.error,
)

const filteredEnrollments = computed<EnrollmentListItem[]>(() => {
    const query = searchQuery.value.trim().toLowerCase()

    return enrollments.value.filter((enrollment) => {
        const matchesStatus =
            selectedStatus.value === 'all' ||
            enrollment.status === selectedStatus.value

        const searchableText = [
            enrollment.fullname,
            enrollment.school_name,
            enrollment.id,
        ]
            .filter(
                (value): value is string =>
                    typeof value === 'string',
            )
            .join(' ')
            .toLowerCase()

        const matchesSearch =
            !query || searchableText.includes(query)

        return matchesStatus && matchesSearch
    })
})

function countByStatus(status: StatusEnrollmentType): number {
    return enrollments.value.filter(
        (item) => item.status === status,
    ).length
}

const summary = computed(() => ({
    total: enrollments.value.length,
    pending: countByStatus('pending'),
    approved: countByStatus('approved'),
    active: countByStatus('active'),
    rejected: countByStatus('rejected'),
}))

type DisplayStatus = StatusEnrollmentType | 'cancelled'

const statusStyles: Record<DisplayStatus, string> = {
    pending: 'bg-accent/15 text-accent',
    approved: 'bg-success/15 text-success',
    active: 'bg-primary/15 text-primary',
    rejected: 'bg-alert/15 text-alert',
    cancelled: 'bg-slate-100 text-slate-700',
}

function statusStyle(status: DisplayStatus): string {
    return statusStyles[status] ?? 'bg-slate-100 text-slate-700'
}

const statusDescriptions: Record<DisplayStatus, string> = {
    pending: 'Waiting for administrator review',
    approved: 'Your enrollment has been approved',
    active: 'You are an active student',
    rejected: 'Your enrollment was rejected',
    cancelled: 'This enrollment was cancelled',
}

function statusDescription(status: DisplayStatus): string {
    return statusDescriptions[status] ?? 'Check your enrollment status'
}

function formatDate(
    value: string | null | undefined,
): string {
    if (!value) return 'Not available'

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
        return 'Not available'
    }

    return new Intl.DateTimeFormat('en-ID', {
        dateStyle: 'medium',
    }).format(date)
}

function openEnrollment(enrollment: EnrollmentListItem): void {
    void router.push({
        name: 'student.enrollment-detail',
        params: {
            enrollmentId: enrollment.id,
        },
    })
}

function exploreCourses(): void {
    void router.push({
        name: 'student.explore',
    })
}

async function loadEnrollments(): Promise<void> {
    const currentStudentId = studentId.value

    if (!currentStudentId) return

    try {
        await enrollmentStore.fetchMyEnrollments(currentStudentId)
    } catch (error: unknown) {
        console.error('Failed to load enrollments:', error)
    }
}

onMounted(() => {
    void loadEnrollments()
})

watch(studentId, (newId, oldId) => {
    if (newId && newId !== oldId) {
        void loadEnrollments()
    }
})
</script>


<template>
    <main class="min-h-screen py-8 sm:py-10">
        <div class="mx-auto">
            <!-- Page header -->
            <header class="sticky top-0 flex flex-col justify-between gap-5 sm:flex-row sm:items-end bg-surface py-5 border-b border-text-primary m-0">
                <div>
                    <button type="button" class="mb-5 text-sm font-medium text-slate-500 hover:text-primary"
                        @click="router.push('/')">
                        &larr; Back to dashboard
                    </button>

                    <p class="text-sm font-semibold uppercase tracking-widest text-accent">
                        Student dashboard
                    </p>

                    <h1 class="mt-2 text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">
                        My Enrollments
                    </h1>

                    <p class="mt-3 max-w-xl text-slate-600">
                        Keep track of your course applications and enrollment
                        status in one place.
                    </p>
                </div>
                
                <CustomButton @click="exploreCourses">Explore Courses</CustomButton>
            </header>

            <!-- Summary cards -->
            <section class="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
                <article class="rounded-2xl border border-text-secondary bg-surface p-5">
                    <div class="flex items-center justify-between gap-2">
                        <p class="text-sm font-medium text-text-secondary">
                            Total Enrollments
                        </p>
                        <Layers class="text-text-secondary" :size="18"/>
                    </div>
                    <p class="mt-3 text-3xl font-extrabold text-text-primary">
                        {{ summary.total }}
                    </p>
                </article>

                <article class="rounded-2xl border border-accent bg-surface p-5">
                    <div class="flex items-center justify-between gap-2">
                        <p class="text-sm font-medium text-text-secondary">
                            Pending
                        </p>
                        <Clock3 class="text-warning" :size="18"/>
                    </div>
                    <p class="mt-3 text-3xl font-extrabold text-warning">
                        {{ summary.pending }}
                    </p>
                </article>

                <article class="rounded-2xl border border-success bg-surface p-5">
                    <div class="flex items-center justify-between gap-2">
                        <p class="text-sm font-medium text-text-secondary">
                            Approved
                        </p>
                        <CheckCircle2 class="text-success" :size="18"/>
                    </div>
                    <p class="mt-3 text-3xl font-extrabold text-success">
                        {{ summary.approved }}
                    </p>
                </article>

                <article class="rounded-2xl border border-secondary bg-surface p-5">
                    <div class="flex items-center justify-between gap-2">
                        <p class="text-sm font-medium text-text-secondary">
                            Active
                        </p>
                        <GraduationCap color="#4338ca" :size="18"/>
                    </div>
                    <p class="mt-3 text-3xl font-extrabold text-primary">
                        {{ summary.active }}
                    </p>
                </article>

                <article class="rounded-2xl border border-alert bg-surface p-5">
                    <div class="flex items-center justify-between gap-2">
                        <p class="text-sm font-medium text-text-secondary">
                            Rejected
                        </p>
                        <AlertCircle class="text-alert" :size="18"/>
                    </div>
                    <p class="mt-3 text-3xl font-extrabold text-alert">
                        {{ summary.rejected }}
                    </p>
                </article>
            </section>

            <!-- Search and filter -->
            <section class="mt-8 rounded-2xl border border-text-primary bg-surface p-4 sm:p-5">
                <div class="flex flex-col gap-4 md:flex-row">
                    <div class="relative flex-1">
                        <input v-model="searchQuery" type="search"
                            placeholder="Search by course, program, or enrollment ID..."
                            class="w-full rounded-xl border border-text-primary py-3 pl-4 pr-4 text-sm outline-none transition focus:border-secondary/90 focus:ring-2 focus:ring-rose-100" />
                    </div>

                    <select v-model="selectedStatus" aria-label="Filter enrollments by status"
                        class="rounded-xl border border-text-primary bg-surface px-4 py-3 text-sm outline-none focus:border-secondary/90 focus:ring-2 focus:ring-rose-100 md:w-56">
                        <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                            {{ option.label }}
                        </option>
                    </select>
                </div>

                <div class="mt-4 flex items-center justify-between text-sm text-slate-500">
                    <p>
                        Showing
                        <strong class="text-text-primary">
                            {{ filteredEnrollments.length }}
                        </strong>
                        of {{ enrollments.length }} enrollments
                    </p>

                    <button v-if="searchQuery || selectedStatus !== 'all'" type="button"
                        class="font-semibold text-primary/90 hover:text-primary-hover"
                        @click="searchQuery = ''; selectedStatus = 'all'">
                        Clear filters
                    </button>
                </div>
            </section>

            <!-- Loading state -->
            <section v-if="loading && enrollments.length === 0" class="mt-6 grid gap-5 md:grid-cols-2"
                aria-label="Loading enrollments">
                <div v-for="item in 4" :key="item"
                    class="animate-pulse rounded-2xl border border-slate-200 bg-white p-6">
                    <div class="h-5 w-2/3 rounded bg-slate-200" />
                    <div class="mt-4 h-4 w-1/2 rounded bg-slate-200" />
                    <div class="mt-6 h-16 rounded-xl bg-slate-100" />
                    <div class="mt-5 h-10 rounded-lg bg-slate-200" />
                </div>
            </section>

            <!-- Error state -->
            <section v-else-if="error && enrollments.length === 0"
                class="mt-6 rounded-2xl border border-accent/20 bg-white p-8 text-center">
                <CircleAlert :size="34" color="#dc2626"/>
                <h2 class="mt-4 text-xl font-bold text-text-primary">
                    Couldn't Load Enrollments
                </h2>
                <p class="mt-2 text-sm text-slate-600">
                    {{ error }}
                </p>
                <button type="button" class="mt-5 rounded-xl bg-text-primary px-5 py-3 font-semibold text-white"
                    @click="loadEnrollments">
                    Try Again
                </button>
            </section>

            <!-- Empty state -->
            <section v-else-if="filteredEnrollments.length === 0"
                class="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
                <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/15 text-accent">
                    <GraduationCap />
                </div>

                <h2 class="mt-5 text-xl font-bold text-text-primary">
                    {{
                        enrollments.length === 0
                            ? 'No Enrollments Yet'
                            : 'No Matching Enrollments'
                    }}
                </h2>

                <p class="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    {{
                        enrollments.length === 0
                            ? 'Explore available courses and submit your first enrollment to get started.'
                            : 'Try changing your search keywords or selecting a different status.'
                    }}
                </p>

                <button v-if="enrollments.length === 0" type="button"
                    class="mt-6 rounded-xl bg-accent/90 px-5 py-3 font-semibold text-white hover:bg-accent"
                    @click="exploreCourses">
                    Explore Courses
                </button>

                <button v-else type="button"
                    class="mt-6 rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                    @click="searchQuery = ''; selectedStatus = 'all'">
                    Clear Filters
                </button>
            </section>

            <!-- Enrollment list -->
            <section v-else class="mt-6 grid gap-5 md:grid-cols-2">
                <article v-for="enrollment in filteredEnrollments" :key="enrollment.id"
                    class="flex flex-col rounded-2xl border border-text-primary bg-surface p-5 shadow-sm transition hover:border-secondary/60 hover:shadow-md sm:p-6">
                    <div class="flex items-start justify-between gap-3">
                        <div class="flex min-w-0 items-start gap-3">
                            <div
                                class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary/15 text-primary">
                                <BookOpen />
                            </div>

                            <div class="min-w-0">
                                <h2 class="wrap-break-word- text-lg font-bold text-text-primary">
                                    {{ enrollment.course?.name ?? 'Course details unavailable' }}
                                </h2>
                                <p class="mt-1 text-sm text-text-secondary">
                                    {{ enrollment.program?.name ?? 'Program details unavailable' }}
                                </p>
                            </div>
                        </div>

                        <span class="shrink-0 rounded-full px-3 py-1 text-xs font-bold capitalize"
                            :class="statusStyle(enrollment.status)">
                            {{ enrollment.status }}
                        </span>
                    </div>

                    <div class="mt-5 rounded-xl bg-slate-50 p-4">
                        <p class="text-sm font-semibold text-slate-800">
                            {{ statusDescription(enrollment.status) }}
                        </p>

                        <div class="mt-3 flex items-center gap-2 text-xs text-slate-500">
                            <CalendarDays :size="12"/>
                            Submitted {{ formatDate(enrollment.created_at) }}
                        </div>
                    </div>

                    <div class="mt-4 space-y-2 text-sm">
                        <div class="flex justify-between gap-3">
                            <span class="text-slate-500">Student</span>
                            <span class="text-right font-medium text-slate-800">
                                {{ enrollment.fullname }}
                            </span>
                        </div>

                        <div class="flex justify-between gap-3">
                            <span class="text-slate-500">Enrollment ID</span>
                            <span class="max-w-[65%] break-all text-right font-medium text-slate-800">
                                {{ enrollment.id }}
                            </span>
                        </div>
                    </div>

                    <button type="button"
                        class="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-text-secondary px-4 py-3 text-sm font-semibold text-text-primary transition hover:border-secondary/50 hover:bg-secondary/15 hover:text-primary"
                        @click="openEnrollment(enrollment)">
                        View Enrollment Details
                        <ArrowUpRight :size="14"/>
                    </button>
                </article>
            </section>

            <p v-if="error && enrollments.length > 0" role="alert"
                class="mt-5 rounded-xl border border-accent/20 bg-red-50 p-4 text-sm text-red-700">
                {{ error }}
            </p>
        </div>
    </main>
</template>
