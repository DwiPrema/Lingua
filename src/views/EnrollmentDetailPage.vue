<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useEnrollmentStores } from '@/stores/enrollments_stores'
import { useCourseStores } from '@/stores/course_stores'
import { useCourseProgramStore } from '@/stores/course_program_stores'
import { BadgeCheck, BookOpen, CalendarDays, CheckCircle2, CircleMinus, CircleX, Clock3, GraduationCap, Info, ReceiptText, Ticket, TriangleAlert, XCircle } from '@lucide/vue'

const route = useRoute()
const router = useRouter()

const enrollmentStore = useEnrollmentStores()
const courseStore = useCourseStores()
const courseProgramStore = useCourseProgramStore()

const enrollment = ref(null)
const course = ref(null)
const program = ref(null)

const loadingPage = ref(true)
const pageError = ref('')
const cancelling = ref(false)
const showCancelConfirmation = ref(false)

const status = computed(
    () => enrollment.value?.status?.toLowerCase() ?? 'pending',
)

const statusInfo = computed(() => {
    const statuses = {
        pending: {
            title: 'Waiting for Approval',
            description:
                'Your enrollment has been submitted and is waiting for the course administrator to review.',
            icon: Clock3,
            classes: 'bg-amber-50 text-amber-700 border-amber-200',
            badge: 'bg-amber-100 text-amber-800',
        },
        approved: {
            title: 'Enrollment Approved',
            description:
                'Your enrollment has been approved by the course administrator.',
            icon: CheckCircle2,
            classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            badge: 'bg-emerald-100 text-emerald-800',
        },
        rejected: {
            title: 'Enrollment Rejected',
            description:
                'Unfortunately, your enrollment was rejected by the course administrator.',
            icon: CircleX,
            classes: 'bg-red-50 text-red-700 border-red-200',
            badge: 'bg-red-100 text-red-800',
        },
        active: {
            title: 'Enrollment Active',
            description:
                'You are now an active student in this course.',
            icon: BadgeCheck,
            classes: 'bg-indigo-50 text-indigo-700 border-indigo-200',
            badge: 'bg-indigo-100 text-indigo-800',
        },
        cancelled: {
            title: 'Enrollment Cancelled',
            description: 'This enrollment has been cancelled.',
            icon: CircleMinus,
            classes: 'bg-slate-50 text-slate-600 border-slate-200',
            badge: 'bg-slate-100 text-slate-700',
        },
    }

    return statuses[status.value] ?? statuses.pending
})

const formatCurrency = (amount) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(amount) || 0)

const formatDate = (value) => {
    if (!value) return 'Not available'

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) return 'Not available'

    return new Intl.DateTimeFormat('en-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(date)
}

onMounted(loadEnrollmentDetail)

async function loadEnrollmentDetail() {
    loadingPage.value = true
    pageError.value = ''

    try {
        const enrollmentId = route.params.enrollmentId

        if (!enrollmentId) {
            throw new Error('Enrollment ID is missing.')
        }

        const result =
            await enrollmentStore.fetchEnrollmentById(enrollmentId)

        if (!result) {
            throw new Error('Enrollment not found.')
        }

        enrollment.value = result

        course.value = await courseStore.fetchCourseById(
            result.course_id,
        )

        const programs =
            await courseProgramStore.getAllCourseProgram(result.course_id)

        program.value = programs.find(
            (item) => String(item.id) === String(result.program_id),
        ) ?? null
    } catch (err) {
        pageError.value =
            err?.message ?? 'Unable to load enrollment details.'
    } finally {
        loadingPage.value = false
    }
}

async function cancelEnrollment() {
    if (cancelling.value || status.value !== 'pending') return

    cancelling.value = true
    pageError.value = ''

    try {
        await enrollmentStore.cancelEnrollment(enrollment.value.id)

        showCancelConfirmation.value = false
        await loadEnrollmentDetail()
    } catch (err) {
        pageError.value =
            err?.message ?? 'Unable to cancel your enrollment.'
        showCancelConfirmation.value = false
    } finally {
        cancelling.value = false
    }
}

function viewMyCourse() {
    router.push({
        name: 'student.course-detail',
        params: { courseId: enrollment.value.course_id },
    })
}
</script>

<template>
    <main class="min-h-screen bg-slate-50 py-8 sm:py-10">
        <div class="mx-auto">
            <button type="button"
                class="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950"
                @click="router.back()">
                <span aria-hidden="true">←</span>
                Back
            </button>

            <!-- Loading -->
            <div v-if="loadingPage" class="animate-pulse space-y-6">
                <div class="h-48 rounded-2xl bg-slate-200" />
                <div class="h-40 rounded-2xl bg-slate-200" />
                <div class="h-64 rounded-2xl bg-slate-200" />
            </div>

            <!-- Error -->
            <section v-else-if="pageError && !enrollment"
                class="rounded-2xl border border-red-200 bg-white p-8 text-center">
                <h1 class="text-xl font-bold text-slate-900">
                    Unable to Load Enrollment
                </h1>
                <p class="mt-2 text-sm text-alert">{{ pageError }}</p>

                <button type="button"
                    class="mt-5 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                    @click="loadEnrollmentDetail">
                    Try Again
                </button>
            </section>

            <template v-else-if="enrollment">
                <!-- Status summary -->
                <section class="rounded-2xl border p-6 text-center shadow-sm sm:p-9" :class="statusInfo.classes">
                    <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/80">
                        <component :is="statusInfo.icon" :size="32" :stroke-width="2" aria-hidden="true" />
                    </div>

                    <h1 class="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
                        {{ statusInfo.title }}
                    </h1>

                    <p class="mx-auto mt-3 max-w-xl text-sm leading-6 opacity-90">
                        {{ statusInfo.description }}
                    </p>

                    <span class="mt-5 inline-flex rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider"
                        :class="statusInfo.badge">
                        {{ status }}
                    </span>
                </section>

                <!-- Course information -->
                <section class="mt-8">
                    <h2 class="text-xl font-bold text-slate-900">
                        Course Information
                    </h2>

                    <div class="mt-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                        <div class="flex items-center gap-4">
                            <div
                                class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/25 text-accent">
                                <graduation-cap />
                            </div>

                            <div class="min-w-0">
                                <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Course
                                </p>
                                <h3 class="mt-1 text-lg font-bold text-slate-900">
                                    {{ course?.name ?? 'Course unavailable' }}
                                </h3>

                                <p class="mt-1 text-sm text-slate-500">
                                    Program:
                                    <span class="font-semibold text-slate-700">
                                        {{ program?.name ?? 'Program unavailable' }}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Fee information -->
                <section class="mt-8">
                    <h2 class="text-xl font-bold text-slate-900">
                        Fee Information
                    </h2>

                    <div class="mt-4 grid gap-4 sm:grid-cols-2">
                        <div class="rounded-2xl border border-slate-200 bg-white p-5">
                            <div class="flex items-center gap-2 text-sm text-slate-500">
                                <ReceiptText :size="16"/>
                                Registration Fee
                            </div>
                            <p class="mt-3 text-xl font-bold text-slate-900">
                                {{ formatCurrency(program?.registration_fee) }}
                            </p>
                        </div>

                        <div class="rounded-2xl border border-slate-200 bg-white p-5">
                            <div class="flex items-center gap-2 text-sm text-slate-500">
                                <CalendarDays :size="16"/>
                                Monthly Fee
                            </div>
                            <p class="mt-3 text-xl font-bold text-slate-900">
                                {{ formatCurrency(program?.monthly_fee) }}
                            </p>
                        </div>
                    </div>
                </section>

                <!-- Student information -->
                <section class="mt-8">
                    <h2 class="text-xl font-bold text-slate-900">
                        Student Information
                    </h2>

                    <div class="mt-4 grid gap-4 sm:grid-cols-2">
                        <div class="rounded-2xl border border-slate-200 bg-white p-5">
                            <p class="text-xs font-medium uppercase tracking-wider text-slate-500">
                                Full Name
                            </p>
                            <p class="mt-2 wrap-break-word font-semibold text-slate-900">
                                {{ enrollment.fullname }}
                            </p>
                        </div>

                        <div class="rounded-2xl border border-slate-200 bg-white p-5">
                            <p class="text-xs font-medium uppercase tracking-wider text-slate-500">
                                Phone Number
                            </p>
                            <p class="mt-2 wrap-break-word font-semibold text-slate-900">
                                {{ enrollment.phone }}
                            </p>
                        </div>

                        <div class="rounded-2xl border border-slate-200 bg-white p-5">
                            <p class="text-xs font-medium uppercase tracking-wider text-slate-500">
                                Education Level
                            </p>
                            <p class="mt-2 wrap-break-word font-semibold text-slate-900">
                                {{ enrollment.education_level }}
                            </p>
                        </div>

                        <div class="rounded-2xl border border-slate-200 bg-white p-5">
                            <p class="text-xs font-medium uppercase tracking-wider text-slate-500">
                                School / Institution
                            </p>
                            <p class="mt-2 wrap-break-word font-semibold text-slate-900">
                                {{ enrollment.school_name }}
                            </p>
                        </div>

                        <div class="rounded-2xl border border-slate-200 bg-white p-5 sm:col-span-2">
                            <p class="text-xs font-medium uppercase tracking-wider text-slate-500">
                                Address
                            </p>
                            <p class="mt-2 whitespace-pre-line wrap-break-word font-semibold leading-6 text-slate-900">
                                {{ enrollment.address }}
                            </p>
                        </div>
                    </div>
                </section>

                <!-- Enrollment metadata -->
                <section class="mt-8">
                    <h2 class="text-xl font-bold text-slate-900">
                        Enrollment Information
                    </h2>

                    <div class="mt-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                        <div class="flex items-start gap-3">
                            <div class="rounded-xl bg-accent/25 p-3 text-accent">
                                <Ticket />
                            </div>

                            <div class="min-w-0">
                                <p class="text-xs font-medium uppercase tracking-wider text-slate-500">
                                    Enrollment ID
                                </p>
                                <p class="mt-1 break-all font-semibold text-slate-900">
                                    {{ enrollment.id }}
                                </p>
                            </div>
                        </div>

                        <div class="mt-5 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
                            <div>
                                <p class="text-xs text-slate-500">Submitted</p>
                                <p class="mt-1 text-sm font-medium text-slate-800">
                                    {{ formatDate(enrollment.created_at) }}
                                </p>
                            </div>

                            <div>
                                <p class="text-xs text-slate-500">Enrolled At</p>
                                <p class="mt-1 text-sm font-medium text-slate-800">
                                    {{ formatDate(enrollment.enrolled_at) }}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Feedback if an action fails -->
                <p v-if="pageError" role="alert"
                    class="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {{ pageError }}
                </p>

                <!-- Status-specific actions -->
                <section class="mt-8 space-y-4">
                    <button v-if="status === 'approved' || status === 'active'" type="button"
                        class="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3.5 font-semibold text-white transition hover:bg-rose-900"
                        @click="viewMyCourse">
                         <BookOpen :size="16"/>
                        View My Course
                    </button>

                    <div v-if="status === 'pending'" class="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                        <div class="flex items-start gap-3">
                             <Info color="#b45309"/>
                            <p class="text-sm leading-6 text-amber-900">
                                Please wait while the course administrator
                                reviews your enrollment. You can return here
                                later to check its status.
                            </p>
                        </div>
                    </div>

                    <button v-if="status === 'pending'" type="button"
                        class="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3.5 font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                        :disabled="cancelling" @click="showCancelConfirmation = true">
                        Cancel Enrollment
                    </button>

                    <button type="button"
                        class="w-full rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                        @click="router.back()">
                        Back to Previous Page
                    </button>
                </section>
            </template>
        </div>

        <!-- Cancel confirmation -->
        <div v-if="showCancelConfirmation"
            class="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 sm:items-center sm:p-4"
            @click.self="showCancelConfirmation = false">
            <section role="dialog" aria-modal="true" aria-labelledby="cancel-title"
                class="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-2xl">
                <div class="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-alert">
                    <TriangleAlert />
                </div>

                <h2 id="cancel-title" class="mt-4 text-xl font-bold text-slate-900">
                    Cancel Enrollment?
                </h2>

                <p class="mt-2 text-sm leading-6 text-slate-600">
                    Are you sure you want to cancel your enrollment for
                    <strong>{{ course?.name }}</strong>?
                    This action cannot be undone from this page.
                </p>

                <div class="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
                    <button type="button"
                        class="flex-1 rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-700"
                        :disabled="cancelling" @click="showCancelConfirmation = false">
                        Keep Enrollment
                    </button>

                    <button type="button"
                        class="flex-1 rounded-xl bg-alert px-4 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                        :disabled="cancelling" @click="cancelEnrollment">
                        {{ cancelling ? 'Cancelling...' : 'Yes, Cancel' }}
                    </button>
                </div>
            </section>
        </div>
    </main>
</template>
