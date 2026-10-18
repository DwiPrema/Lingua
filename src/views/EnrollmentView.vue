<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { useEnrollmentStores } from '@/stores/enrollments_stores'
import { useAuthStore } from '@/stores/auth_stores'

const router = useRouter()
const enrollmentStore = useEnrollmentStores()
const authStore = useAuthStore()

const searchQuery = ref('')
const selectedStatus = ref('all')

const statusOptions = [
    { label: 'All Enrollments', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Active', value: 'active' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Cancelled', value: 'cancelled' },
]

const studentId = computed(
    () => authStore.user?.id ?? authStore.session?.user?.id ?? null,
)

const enrollments = computed(() => enrollmentStore.enrollments)
const loading = computed(() => enrollmentStore.loading)
const error = computed(() => enrollmentStore.error)

const filteredEnrollments = computed(() => {
    const query = searchQuery.value.trim().toLowerCase()

    return enrollments.value.filter((enrollment) => {
        const matchesStatus =
            selectedStatus.value === 'all' ||
            enrollment.status?.toLowerCase() === selectedStatus.value

        // Uses course/program names if your service provides them.
        const searchableText = [
            enrollment.course?.name,
            enrollment.program?.name,
            enrollment.fullname,
            enrollment.school_name,
            enrollment.id,
        ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()

        const matchesSearch =
            !query || searchableText.includes(query)

        return matchesStatus && matchesSearch
    })
})

const summary = computed(() => ({
    total: enrollments.value.length,
    pending: countByStatus('pending'),
    approved: countByStatus('approved'),
    active: countByStatus('active'),
}))

function countByStatus(status) {
    return enrollments.value.filter(
        (item) => item.status?.toLowerCase() === status,
    ).length
}

function statusStyle(status) {
    const styles = {
        pending: 'bg-amber-100 text-amber-800',
        approved: 'bg-emerald-100 text-emerald-800',
        active: 'bg-indigo-100 text-indigo-800',
        rejected: 'bg-red-100 text-red-800',
        cancelled: 'bg-slate-100 text-slate-700',
    }

    return styles[status?.toLowerCase()] ??
        'bg-slate-100 text-slate-700'
}

function statusDescription(status) {
    const descriptions = {
        pending: 'Waiting for administrator review',
        approved: 'Your enrollment has been approved',
        active: 'You are an active student',
        rejected: 'Your enrollment was rejected',
        cancelled: 'This enrollment was cancelled',
    }

    return descriptions[status?.toLowerCase()] ??
        'Check your enrollment status'
}

function formatDate(value) {
    if (!value) return 'Not available'

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) return 'Not available'

    return new Intl.DateTimeFormat('en-ID', {
        dateStyle: 'medium',
    }).format(date)
}

function openEnrollment(enrollment) {
    router.push({
        name: 'student.enrollment-detail',
        params: { enrollmentId: enrollment.id },
    })
}

function exploreCourses() {
    router.push({ name: 'student.explore' })
}

async function loadEnrollments() {
    if (!studentId.value) return

    try {
        await enrollmentStore.fetchMyEnrollments(studentId.value)
    } catch {
        // The store already exposes the error state.
    }
}

onMounted(loadEnrollments)

watch(studentId, (newId, oldId) => {
    if (newId !== oldId && newId) {
        loadEnrollments()
    }
})
</script>

<template>
    <main class="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 sm:py-10">
        <div class="mx-auto max-w-6xl">
            <!-- Page header -->
            <header class="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div>
                    <p class="text-sm font-semibold uppercase tracking-widest text-rose-800">
                        Student dashboard
                    </p>

                    <h1 class="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                        My Enrollments
                    </h1>

                    <p class="mt-3 max-w-xl text-slate-600">
                        Keep track of your course applications and enrollment
                        status in one place.
                    </p>
                </div>

                <button type="button"
                    class="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-800 px-5 py-3 font-semibold text-white transition hover:bg-rose-900"
                    @click="exploreCourses">
                    <icon name="search" size="18" />
                    Explore Courses
                </button>
            </header>

            <!-- Summary cards -->
            <section class="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <article class="rounded-2xl border border-slate-200 bg-white p-5">
                    <div class="flex items-center justify-between gap-2">
                        <p class="text-sm font-medium text-slate-500">
                            Total Enrollments
                        </p>
                        <icon name="layers" size="20" color="#64748b" />
                    </div>
                    <p class="mt-3 text-3xl font-extrabold text-slate-900">
                        {{ summary.total }}
                    </p>
                </article>

                <article class="rounded-2xl border border-amber-200 bg-white p-5">
                    <div class="flex items-center justify-between gap-2">
                        <p class="text-sm font-medium text-slate-500">
                            Pending
                        </p>
                        <icon name="clock-3" size="20" color="#b45309" />
                    </div>
                    <p class="mt-3 text-3xl font-extrabold text-amber-700">
                        {{ summary.pending }}
                    </p>
                </article>

                <article class="rounded-2xl border border-emerald-200 bg-white p-5">
                    <div class="flex items-center justify-between gap-2">
                        <p class="text-sm font-medium text-slate-500">
                            Approved
                        </p>
                        <icon name="check-circle-2" size="20" color="#047857" />
                    </div>
                    <p class="mt-3 text-3xl font-extrabold text-emerald-700">
                        {{ summary.approved }}
                    </p>
                </article>

                <article class="rounded-2xl border border-indigo-200 bg-white p-5">
                    <div class="flex items-center justify-between gap-2">
                        <p class="text-sm font-medium text-slate-500">
                            Active
                        </p>
                        <icon name="graduation-cap" size="20" color="#4338ca" />
                    </div>
                    <p class="mt-3 text-3xl font-extrabold text-indigo-700">
                        {{ summary.active }}
                    </p>
                </article>
            </section>

            <!-- Search and filter -->
            <section class="mt-8 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                <div class="flex flex-col gap-4 md:flex-row">
                    <div class="relative flex-1">
                        <icon name="search" size="18" color="#94a3b8" />
                        <input v-model="searchQuery" type="search"
                            placeholder="Search by course, program, or enrollment ID..."
                            class="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-rose-700 focus:ring-2 focus:ring-rose-100" />
                    </div>

                    <select v-model="selectedStatus" aria-label="Filter enrollments by status"
                        class="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-rose-700 focus:ring-2 focus:ring-rose-100 md:w-56">
                        <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                            {{ option.label }}
                        </option>
                    </select>
                </div>

                <div class="mt-4 flex items-center justify-between text-sm text-slate-500">
                    <p>
                        Showing
                        <strong class="text-slate-900">
                            {{ filteredEnrollments.length }}
                        </strong>
                        of {{ enrollments.length }} enrollments
                    </p>

                    <button v-if="searchQuery || selectedStatus !== 'all'" type="button"
                        class="font-semibold text-rose-800 hover:text-rose-950"
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
                class="mt-6 rounded-2xl border border-red-200 bg-white p-8 text-center">
                <icon name="circle-alert" size="36" color="#dc2626" />
                <h2 class="mt-4 text-xl font-bold text-slate-900">
                    Couldn't Load Enrollments
                </h2>
                <p class="mt-2 text-sm text-slate-600">
                    {{ error }}
                </p>
                <button type="button" class="mt-5 rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white"
                    @click="loadEnrollments">
                    Try Again
                </button>
            </section>

            <!-- Empty state -->
            <section v-else-if="filteredEnrollments.length === 0"
                class="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
                <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-800">
                    <icon name="graduation-cap" size="30" />
                </div>

                <h2 class="mt-5 text-xl font-bold text-slate-900">
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
                    class="mt-6 rounded-xl bg-rose-800 px-5 py-3 font-semibold text-white hover:bg-rose-900"
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
                    class="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-rose-200 hover:shadow-md sm:p-6">
                    <div class="flex items-start justify-between gap-3">
                        <div class="flex min-w-0 items-start gap-3">
                            <div
                                class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-800">
                                <icon name="book-open" size="23" />
                            </div>

                            <div class="min-w-0">
                                <h2 class="wrap-break-word- text-lg font-bold text-slate-900">
                                    {{ enrollment.course?.name ?? 'Course details unavailable' }}
                                </h2>
                                <p class="mt-1 text-sm text-slate-500">
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
                            <icon name="calendar-days" size="15" />
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
                        class="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-900"
                        @click="openEnrollment(enrollment)">
                        View Enrollment Details
                        <icon name="arrow-up-right" size="17" />
                    </button>
                </article>
            </section>

            <p v-if="error && enrollments.length > 0" role="alert"
                class="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {{ error }}
            </p>
        </div>
    </main>
</template>
