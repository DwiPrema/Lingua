```vue
<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
    ArrowLeft,
    Users,
    Phone,
    School,
    GraduationCap,
    CircleAlert,
    RefreshCw,
    Check,
    X,
    Clock3,
    MessageSquareWarning,
} from '@lucide/vue'

import { useCourseStores } from '@/stores/course_stores'
import { useEnrollmentStores } from '@/stores/enrollments_stores'

const route = useRoute()
const router = useRouter()

const courseStore = useCourseStores()
const enrollmentStore = useEnrollmentStores()

const course = ref(null)
const enrollments = ref([])
const loading = ref(false)
const error = ref(null)

const processingId = ref(null)
const rejectingEnrollmentId = ref(null)
const rejectionReason = ref('')
const actionError = ref(null)

const courseId = computed(() => route.params.courseId)

const pendingEnrollments = computed(() =>
    enrollments.value.filter(
        (item) => item.status === 'pending',
    ),
)

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
    if (!date) return '-'

    const parsedDate = new Date(date)

    if (Number.isNaN(parsedDate.getTime())) return '-'

    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(parsedDate)
}

async function fetchEnrollments() {
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

        const result =
            await enrollmentStore.fetchPendingEnrollmentsByCourseId(
                courseId.value,
            )

        enrollments.value = Array.isArray(result)
            ? result
            : result?.data ?? []
    } catch (err) {
        console.error('Failed to load enrollments:', err)

        error.value =
            err?.message ?? 'Gagal memuat data pendaftaran.'
    } finally {
        loading.value = false
    }
}

async function approveEnrollment(enrollment) {
    const confirmed = window.confirm(
        `Setujui pendaftaran ${enrollment.fullname || 'siswa ini'}?`,
    )

    if (!confirmed) return

    processingId.value = enrollment.id
    actionError.value = null

    try {
        // Action store memanggil RPC approve_enrollment.
        await enrollmentStore.approveEnrollment(enrollment.id)

        enrollments.value = enrollments.value.filter(
            (item) => item.id !== enrollment.id,
        )
    } catch (err) {
        console.error('Failed to approve enrollment:', err)

        actionError.value =
            err?.message ?? 'Gagal menyetujui pendaftaran.'
    } finally {
        processingId.value = null
    }
}

function openRejectForm(enrollment) {
    rejectingEnrollmentId.value = enrollment.id
    rejectionReason.value = ''
    actionError.value = null
}

function cancelReject() {
    rejectingEnrollmentId.value = null
    rejectionReason.value = ''
    actionError.value = null
}

async function rejectEnrollment(enrollment) {
    const reason = rejectionReason.value.trim()

    if (!reason) {
        actionError.value = 'Alasan penolakan wajib diisi.'
        return
    }

    processingId.value = enrollment.id
    actionError.value = null

    try {
        // Action store memanggil RPC reject_enrollment.
        await enrollmentStore.rejectEnrollment(
            enrollment.id,
            reason,
        )

        enrollments.value = enrollments.value.filter(
            (item) => item.id !== enrollment.id,
        )

        cancelReject()
    } catch (err) {
        console.error('Failed to reject enrollment:', err)

        actionError.value =
            err?.message ?? 'Gagal menolak pendaftaran.'
    } finally {
        processingId.value = null
    }
}

function goBack() {
    router.back()
}

onMounted(fetchEnrollments)

watch(courseId, (newId, oldId) => {
    if (newId && newId !== oldId) {
        course.value = null
        enrollments.value = []
        cancelReject()
        fetchEnrollments()
    }
})
</script>

<template>
    <main class="min-h-screen bg-slate-50">
        <div class="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
            <!-- Header -->
            <header class="flex items-center gap-3">
                <button type="button" aria-label="Kembali" class="rounded-xl border border-slate-200 bg-white p-2.5
                           text-slate-600 transition hover:bg-slate-100" @click="goBack">
                    <ArrowLeft class="size-5" />
                </button>

                <div class="flex size-11 shrink-0 items-center justify-center
                           rounded-xl bg-amber-100 text-amber-700">
                    <Clock3 class="size-6" />
                </div>

                <div>
                    <h1 class="text-xl font-bold tracking-tight text-slate-900">
                        Manage Enrollments
                    </h1>

                    <p class="mt-0.5 text-sm text-slate-500">
                        Review student applications for this course.
                    </p>
                </div>
            </header>

            <!-- Course information -->
            <section class="rounded-2xl border border-slate-200 bg-white p-5
                       shadow-sm sm:p-6">
                <p class="text-xs font-semibold uppercase tracking-wider
                           text-slate-400">
                    Course
                </p>

                <template v-if="course">
                    <h2 class="mt-2 text-2xl font-bold text-slate-900">
                        {{ course.name || 'Untitled course' }}
                    </h2>

                    <p class="mt-2 text-sm leading-6 text-slate-500">
                        Review applications and decide whether to approve
                        or reject each student.
                    </p>
                </template>

                <div v-else class="mt-3 space-y-2">
                    <div class="h-7 w-2/3 animate-pulse rounded bg-slate-200" />
                    <div class="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
                </div>
            </section>

            <!-- Enrollment list heading -->
            <section class="space-y-4">
                <div class="flex flex-wrap items-center justify-between gap-3">
                    <div class="flex items-center gap-2.5">
                        <Users class="size-5 text-slate-600" />

                        <h2 class="text-lg font-bold text-slate-900">
                            Pending Applications
                        </h2>

                        <span class="rounded-full bg-amber-50 px-2.5 py-1
                                   text-xs font-semibold text-amber-700">
                            {{ pendingEnrollments.length }}
                        </span>
                    </div>

                    <button type="button" :disabled="loading" class="inline-flex items-center gap-2 rounded-xl
                               border border-slate-200 bg-white px-3 py-2
                               text-sm font-semibold text-slate-700
                               transition hover:bg-slate-100
                               disabled:cursor-not-allowed disabled:opacity-50" @click="fetchEnrollments">
                        <RefreshCw class="size-4" :class="{ 'animate-spin': loading }" />
                        Refresh
                    </button>
                </div>

                <!-- Action error -->
                <div v-if="actionError" role="alert" class="flex items-start gap-2 rounded-xl border
                           border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <CircleAlert class="mt-0.5 size-5 shrink-0" />
                    <p class="flex-1">{{ actionError }}</p>

                    <button type="button" aria-label="Tutup pesan" @click="actionError = null">
                        <X class="size-4" />
                    </button>
                </div>

                <!-- Loading -->
                <div v-if="loading" class="grid grid-cols-1 gap-3 xl:grid-cols-2">
                    <div v-for="item in 4" :key="item" class="rounded-2xl border border-slate-200
                               bg-white p-5">
                        <div class="flex animate-pulse items-center gap-3">
                            <div class="size-12 rounded-full bg-slate-200" />

                            <div class="flex-1 space-y-2">
                                <div class="h-4 w-40 rounded bg-slate-200" />
                                <div class="h-3 w-28 rounded bg-slate-100" />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Fetch error -->
                <div v-else-if="error" class="rounded-2xl border border-red-200
                           bg-white p-6 text-center">
                    <CircleAlert class="mx-auto size-9 text-red-500" />

                    <h3 class="mt-3 font-semibold text-slate-900">
                        Can't load enrollment data
                    </h3>

                    <p class="mt-1 text-sm text-slate-500">
                        {{ error }}
                    </p>

                    <button type="button" class="mt-4 inline-flex items-center gap-2 rounded-xl
                               bg-slate-900 px-4 py-2.5 text-sm font-semibold
                               text-white transition hover:bg-slate-700" @click="fetchEnrollments">
                        <RefreshCw class="size-4" />
                        Try again
                    </button>
                </div>

                <!-- Empty state -->
                <div v-else-if="pendingEnrollments.length === 0" class="rounded-2xl border border-dashed border-slate-300
                           bg-white px-5 py-14 text-center">
                    <div class="mx-auto flex size-14 items-center justify-center
                               rounded-2xl bg-slate-100 text-slate-500">
                        <Users class="size-7" />
                    </div>

                    <h3 class="mt-4 font-semibold text-slate-900">
                        No pending applications
                    </h3>

                    <p class="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">
                        New student applications will appear here when
                        students enroll in this course.
                    </p>
                </div>

                <!-- Enrollment cards -->
                <div v-else class="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    <article v-for="enrollment in pendingEnrollments" :key="enrollment.id" class="overflow-hidden rounded-2xl border
                               border-slate-200 bg-white shadow-sm">
                        <div class="space-y-4 p-5">
                            <!-- Student heading -->
                            <div class="flex items-start gap-3">
                                <div class="flex size-12 shrink-0 items-center
                                           justify-center rounded-full bg-indigo-50
                                           text-sm font-bold text-indigo-700">
                                    {{ getInitials(enrollment.fullname) }}
                                </div>

                                <div class="min-w-0 flex-1">
                                    <h3 class="wrap-break-word font-semibold
                                               text-slate-900">
                                        {{ enrollment.fullname || 'Unnamed student' }}
                                    </h3>

                                    <p class="mt-1 text-xs text-slate-500">
                                        Submitted
                                        {{ formatDate(enrollment.created_at) }}
                                    </p>
                                </div>

                                <span class="inline-flex shrink-0 items-center gap-1
                                           rounded-full bg-amber-50 px-2.5 py-1
                                           text-xs font-semibold text-amber-700">
                                    <Clock3 class="size-3.5" />
                                    Pending
                                </span>
                            </div>

                            <!-- Student details -->
                            <div class="space-y-2.5 text-sm text-slate-600">
                                <p v-if="enrollment.phone" class="flex items-center gap-2">
                                    <Phone class="size-4 shrink-0 text-slate-400" />
                                    <span class="break-all">
                                        {{ enrollment.phone }}
                                    </span>
                                </p>

                                <p v-if="enrollment.school_name" class="flex items-center gap-2">
                                    <School class="size-4 shrink-0 text-slate-400" />
                                    <span class="wrap-break-word">
                                        {{ enrollment.school_name }}
                                    </span>
                                </p>

                                <p v-if="enrollment.education_level" class="flex items-center gap-2">
                                    <GraduationCap class="size-4 shrink-0 text-slate-400" />
                                    <span>{{ enrollment.education_level }}</span>
                                </p>

                                <p v-if="enrollment.address" class="text-sm leading-6 text-slate-500">
                                    {{ enrollment.address }}
                                </p>
                            </div>

                            <!-- Rejection form -->
                            <div v-if="rejectingEnrollmentId === enrollment.id" class="space-y-3 rounded-xl border border-red-200
                                       bg-red-50/50 p-4">
                                <div class="flex items-center gap-2">
                                    <MessageSquareWarning class="size-5 text-red-600" />

                                    <h4 class="font-semibold text-slate-900">
                                        Rejection reason
                                    </h4>
                                </div>

                                <label :for="`reason-${enrollment.id}`" class="block text-sm text-slate-600">
                                    Explain why this application is rejected.
                                </label>

                                <textarea :id="`reason-${enrollment.id}`" v-model="rejectionReason" rows="3"
                                    maxlength="1000" placeholder="Enter the reason for rejection..." class="w-full resize-y rounded-xl border
                                           border-slate-200 bg-white px-3 py-2.5
                                           text-sm outline-none transition
                                           focus:border-red-400 focus:ring-2
                                           focus:ring-red-100" />

                                <div class="flex flex-wrap justify-end gap-2">
                                    <button type="button" :disabled="processingId === enrollment.id" class="rounded-xl border border-slate-200
                                               bg-white px-3 py-2 text-sm
                                               font-semibold text-slate-700
                                               hover:bg-slate-100
                                               disabled:opacity-50" @click="cancelReject">
                                        Cancel
                                    </button>

                                    <button type="button" :disabled="processingId === enrollment.id ||
                                        !rejectionReason.trim()
                                        " class="inline-flex items-center gap-2
                                               rounded-xl bg-red-600 px-3 py-2
                                               text-sm font-semibold text-white
                                               hover:bg-red-700
                                               disabled:cursor-not-allowed
                                               disabled:opacity-50" @click="rejectEnrollment(enrollment)">
                                        <RefreshCw v-if="processingId === enrollment.id" class="size-4 animate-spin" />
                                        <X v-else class="size-4" />
                                        Confirm rejection
                                    </button>
                                </div>
                            </div>

                            <!-- Review actions -->
                            <div v-else class="flex flex-wrap justify-end gap-2
                                       border-t border-slate-100 pt-4">
                                <button type="button" :disabled="processingId === enrollment.id" class="inline-flex items-center gap-2
                                           rounded-xl border border-red-200
                                           bg-white px-4 py-2.5 text-sm
                                           font-semibold text-red-600
                                           transition hover:bg-red-50
                                           disabled:cursor-not-allowed
                                           disabled:opacity-50" @click="openRejectForm(enrollment)">
                                    <X class="size-4" />
                                    Reject
                                </button>

                                <button type="button" :disabled="processingId === enrollment.id" class="inline-flex items-center gap-2
                                           rounded-xl bg-emerald-600 px-4 py-2.5
                                           text-sm font-semibold text-white
                                           transition hover:bg-emerald-700
                                           disabled:cursor-not-allowed
                                           disabled:opacity-50" @click="approveEnrollment(enrollment)">
                                    <RefreshCw v-if="processingId === enrollment.id" class="size-4 animate-spin" />
                                    <Check v-else class="size-4" />
                                    Approve
                                </button>
                            </div>
                        </div>
                    </article>
                </div>
            </section>
        </div>
    </main>
</template>
```