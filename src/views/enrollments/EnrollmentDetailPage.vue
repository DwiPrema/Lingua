<script setup lang="ts">
import { computed, ref, watch, type Component } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEnrollmentStores } from '@/stores/enrollments_stores'
import { useCourseStores } from '@/stores/course_stores'
import { useCourseProgramStore } from '@/stores/course_program_stores'
import { useInvoiceStore } from '@/stores/invoice_stores'
import { usePaymentStore } from '@/stores/payment_stores'

import {
    BadgeCheck,
    BookOpen,
    CalendarDays,
    CheckCircle2,
    CircleX,
    Clock3,
    GraduationCap,
    Info,
    ReceiptText,
    Ticket,
    TriangleAlert,
} from '@lucide/vue'

import { formatCurrency } from '@/composables/format_currency'
import type { Invoice } from '@/types/invoice_type'
import type { Payment } from '@/types/payment_type'
import type { Course } from '@/types/course_type'
import type { Programs } from '@/types/program_type'
import { Enrollment, StatusEnrollments, StatusEnrollmentType } from '@/types/enrollment_type'
import { formatDate } from '@/composables/formatDate'

const route = useRoute()
const router = useRouter()

const enrollmentStore = useEnrollmentStores()
const courseStore = useCourseStores()
const courseProgramStore = useCourseProgramStore()
const invoiceStore = useInvoiceStore()
const paymentStore = usePaymentStore()

const invoice = ref<Invoice | null>(null)
const invoiceError = ref<string>('')
const invoiceLoading = ref<boolean>(false)
const paymentAttempts = ref<Payment[]>([])
const paymentAttemptsLoading = ref<boolean>(false)
const paymentError = ref<string>('')

const enrollment = ref<Enrollment | null>(null)
const course = ref<Course | null>(null)
const program = ref<Programs | null>(null)

const loadingPage = ref<boolean>(true)
const pageError = ref<string>('')
const cancelling = ref<boolean>(false)
const showCancelConfirmation = ref<boolean>(false)
let detailLoadSequence = 0

interface StatusInfo {
    title: string
    description: string
    icon: Component
    classes: string
    badge: string
    rejectionMessage?: string | null
}

const status = computed<StatusEnrollmentType>(() => {
    return enrollment.value?.status ?? StatusEnrollments.PENDING
})

const statuses: Record<StatusEnrollmentType, StatusInfo> = {
    [StatusEnrollments.PENDING]: {
        title: 'Waiting for Approval',
        description:
            'Your enrollment has been submitted and is waiting for the course administrator to review.',
        icon: Clock3,
        classes: 'bg-accent/15 text-accent border-accent/70',
        badge: 'bg-accent/15 text-accent',
    },

    [StatusEnrollments.APPROVED]: {
        title: 'Enrollment Approved',
        description:
            'Your enrollment has been approved by the course administrator. To activate your enrollment, please finish the payment below!',
        icon: CheckCircle2,
        classes: 'bg-success/15 text-success border-success/70',
        badge: 'bg-success/15 text-success',
    },

    [StatusEnrollments.REJECTED]: {
        title: 'Enrollment Rejected',
        description:
            'Unfortunately, your enrollment was rejected by the course administrator.',
        icon: CircleX,
        classes: 'bg-alert/15 text-alert border-alert/70',
        badge: 'bg-alert/15 text-alert',
    },

    [StatusEnrollments.ACTIVE]: {
        title: 'Enrollment Active',
        description:
            'You are now an active student in this course.',
        icon: BadgeCheck,
        classes: 'bg-primary/15 text-primary border-primary/70',
        badge: 'bg-primary/15 text-primary',
    },
}

const statusInfo = computed<StatusInfo>(() => {
    const info = statuses[status.value]

    return {
        ...info,
        rejectionMessage:
            status.value === StatusEnrollments.REJECTED
                ? enrollment.value?.rejection_reason ?? null
                : null,
    }
})

const latestPayment = computed<Payment | null>(() => {
    return [...paymentAttempts.value].sort((left, right) => {
        const leftTimestamp = Date.parse(left.created_at)
        const rightTimestamp = Date.parse(right.created_at)

        return (Number.isNaN(rightTimestamp) ? 0 : rightTimestamp) -
            (Number.isNaN(leftTimestamp) ? 0 : leftTimestamp)
    })[0] ?? null
})

const paymentNotice = computed(() => {
    if (!invoice.value) return null

    if (
        invoice.value.status === 'pending_verification' ||
        latestPayment.value?.status === 'pending_verification'
    ) {
        return 'pending'
    }

    if (
        invoice.value.status === 'paid' &&
        latestPayment.value?.status === 'verified'
    ) {
        return 'verified'
    }

    if (invoice.value.status === 'paid') {
        return 'invoice-paid'
    }

    if (
        invoice.value.status === 'unpaid' &&
        latestPayment.value?.status === 'rejected'
    ) {
        return 'rejected'
    }

    return null
})

const canStartPayment = computed(() => {
    return invoice.value?.status === 'unpaid' &&
        !paymentAttemptsLoading.value &&
        !paymentError.value &&
        (!latestPayment.value || latestPayment.value.status === 'rejected')
})

function getErrorMessage(
    error: unknown,
    fallback: string,
): string {
    return error instanceof Error ? error.message : fallback
}

watch(
    () => route.params.enrollmentId,
    () => {
        void loadEnrollmentDetail()
    },
    { immediate: true },
)

async function loadEnrollmentDetail(): Promise<void> {
    const requestSequence = ++detailLoadSequence

    loadingPage.value = true
    pageError.value = ''
    invoice.value = null
    invoiceError.value = ''
    invoiceLoading.value = false
    paymentAttempts.value = []
    paymentAttemptsLoading.value = false
    paymentError.value = ''
    paymentStore.clearPayments()
    paymentStore.clearError()
    enrollment.value = null
    course.value = null
    program.value = null

    try {
        const routeParam = route.params.enrollmentId

        const enrollmentId = Array.isArray(routeParam)
            ? routeParam[0]
            : routeParam

        if (!enrollmentId) {
            throw new Error('Enrollment ID is missing.')
        }

        const result =
            await enrollmentStore.fetchEnrollmentById(enrollmentId)

        if (requestSequence !== detailLoadSequence) return

        if (!result) {
            throw new Error('Enrollment not found.')
        }

        enrollment.value = result

        void loadInvoiceAndPayments(
            result.id,
            requestSequence,
        )

        const [loadedCourse, programs] = await Promise.all([
            courseStore.fetchCourseById(result.course_id),
            courseProgramStore.getAllCourseProgram(result.course_id),
        ])

        if (requestSequence !== detailLoadSequence) return

        course.value = loadedCourse
        program.value = programs.find(
            (item) => String(item.id) === String(result.program_id),
        ) ?? null

    } catch (error: unknown) {
        if (requestSequence === detailLoadSequence) {
            pageError.value = getErrorMessage(
                error,
                'Unable to load enrollment details.',
            )
        }
    } finally {
        if (requestSequence === detailLoadSequence) {
            loadingPage.value = false
        }
    }
}

async function loadInvoiceAndPayments(
    enrollmentId: string,
    requestSequence: number,
): Promise<void> {
    invoiceLoading.value = true
    invoiceError.value = ''

    let loadedInvoice: Invoice | null = null

    try {
        loadedInvoice =
            await invoiceStore.getInvoiceByEnrollmentId(enrollmentId)

        if (requestSequence !== detailLoadSequence) return

        invoice.value = loadedInvoice
    } catch (error: unknown) {
        if (requestSequence === detailLoadSequence) {
            invoice.value = null
            invoiceError.value = getErrorMessage(
                error,
                'Unable to load invoice.',
            )
        }
        return
    } finally {
        if (requestSequence === detailLoadSequence) {
            invoiceLoading.value = false
        }
    }

    if (loadedInvoice && requestSequence === detailLoadSequence) {
        await loadPaymentAttempts(loadedInvoice.id, requestSequence)
    }
}

async function loadPaymentAttempts(
    invoiceId: string,
    requestSequence: number,
): Promise<void> {
    paymentAttemptsLoading.value = true
    paymentError.value = ''
    paymentAttempts.value = []

    try {
        const result = await paymentStore.getPaymentsByInvoiceId(invoiceId)

        if (requestSequence === detailLoadSequence) {
            paymentAttempts.value = result
        }
    } catch (error: unknown) {
        if (requestSequence === detailLoadSequence) {
            paymentError.value = getErrorMessage(
                error,
                'Unable to load payment attempts.',
            )
        }
    } finally {
        if (requestSequence === detailLoadSequence) {
            paymentAttemptsLoading.value = false
        }
    }
}

async function cancelEnrollment(): Promise<void> {
    const currentEnrollment = enrollment.value

    if (
        cancelling.value ||
        status.value !== StatusEnrollments.PENDING ||
        !currentEnrollment
    ) {
        return
    }

    cancelling.value = true
    pageError.value = ''

    try {
        await enrollmentStore.deleteEnrollments(
            currentEnrollment.id,
        )

        showCancelConfirmation.value = false

        await router.push({
            name: 'student.enrollments',
        })

    } catch (error: unknown) {
        pageError.value = getErrorMessage(
            error,
            'Unable to cancel your enrollment.',
        )

        showCancelConfirmation.value = false
    } finally {
        cancelling.value = false
    }
}

function viewMyCourse(): void {
    const currentEnrollment = enrollment.value

    if (!currentEnrollment) return

    void router.push({
        name: 'student.course-detail',
        params: {
            courseId: currentEnrollment.course_id,
        },
    })
}
</script>


<template>
    <main class="min-h-screen py-8 sm:py-10">
        <div class="mx-auto">
            <button type="button"
                class="mb-6 inline-flex items-center gap-2 text-[14px] font-semibold text-text-secondary transition hover:text-text-primary"
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
                class="rounded-2xl border border-red-200 bg-surface p-8 text-center">
                <h1 class="text-xl font-bold text-text-primary">
                    Unable to Load Enrollment
                </h1>
                <p class="mt-2 text-[14px] text-alert">{{ pageError }}</p>

                <button type="button"
                    class="mt-5 rounded-xl bg-text-primary px-5 py-3 text-[14px] font-semibold text-surface hover:bg-text-primary"
                    @click="loadEnrollmentDetail">
                    Try Again
                </button>
            </section>

            <template v-else-if="enrollment">
                <!-- Status summary -->
                <section class="rounded-2xl border p-6 text-center shadow-sm sm:p-9" :class="statusInfo.classes">
                    <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface/80">
                        <component :is="statusInfo.icon" :size="32" :stroke-width="2" aria-hidden="true" />
                    </div>

                    <h1 class="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
                        {{ statusInfo.title }}
                    </h1>

                    <p class="mx-auto mt-3 max-w-xl text-[14px] leading-6 opacity-90">
                        {{ statusInfo.description }}
                    </p>

                    <p class="mx-auto mt-3 max-w-xl text-[14px] leading-6 opacity-90" v-if="statusInfo.rejectionMessage">
                        Rejection reason: {{ statusInfo.rejectionMessage }}
                    </p>
                </section>

                <!-- INVOICE SUMMARY -->
                <section v-if="status === 'approved' || status === 'active'" class="mt-8">
                    <div class="flex items-center justify-between gap-3">
                        <h2 class="text-xl font-bold text-text-primary">
                            Payment Information
                        </h2>

                        <span v-if="invoice" class="rounded-full px-3 py-1 text-xs font-bold uppercase" :class="{
                            'bg-warning/15 text-warning': invoice.status === 'unpaid',
                            'bg-secondary/15 text-secondary': invoice.status === 'pending_verification',
                            'bg-success/15 text-success': invoice.status === 'paid',
                            'bg-slate-100 text-text-secondary': invoice.status === 'cancelled',
                        }">
                            Invoice: {{ invoice.status.replaceAll('_', ' ') }}
                        </span>
                    </div>

                    <!-- Loading / Error / Empty -->
                    <div v-if="invoiceError"
                        class="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-[14px] text-alert">
                        {{ invoiceError }}
                    </div>

                    <div v-else-if="invoiceLoading"
                        class="mt-4 rounded-2xl border border-slate-200 bg-surface p-5 text-[14px] text-text-secondary">
                        Loading invoice...
                    </div>

                    <div v-else-if="!invoice" class="mt-4 rounded-2xl border border-slate-200 bg-surface p-5">
                        <p class="text-[14px] text-slate-600">
                            No invoice is available for this enrollment yet.
                        </p>
                    </div>

                    <!-- Invoice Card -->
                    <div v-else class="mt-4 overflow-hidden rounded-2xl border border-text-primary bg-surface shadow-sm">
                        <div class="p-5 sm:p-6">
                            <div class="flex items-start justify-between gap-3">
                                <div>
                                    <p class="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                                        Invoice Number
                                    </p>

                                    <p class="mt-1 break-all font-bold text-text-primary">
                                        {{ invoice.invoice_number }}
                                    </p>
                                </div>

                                <div class="rounded-xl bg-primary/15 p-3 text-primary">
                                    <ReceiptText :size="22" />
                                </div>
                            </div>

                            <div class="mt-5 space-y-3">
                                <div class="flex justify-between gap-3 text-[14px]">
                                    <span class="text-text-secondary">
                                        Registration Fee
                                    </span>

                                    <span class="font-semibold text-text-primary">
                                        {{ formatCurrency(invoice.registration_fee) }}
                                    </span>
                                </div>

                                <div class="flex justify-between gap-3 text-[14px]">
                                    <span class="text-text-secondary">
                                        First Month Fee
                                    </span>

                                    <span class="font-semibold text-text-primary">
                                        {{ formatCurrency(invoice.monthly_fee) }}
                                    </span>
                                </div>

                                <div class="border-t border-slate-100 pt-4">
                                    <div class="flex items-center justify-between gap-3">
                                        <span class="font-bold text-text-primary">
                                            Total Amount
                                        </span>

                                        <span class="text-xl font-extrabold text-text-primary">
                                            {{ formatCurrency(invoice.total_amount) }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="border-t border-slate-100 bg-slate-50 p-4 flex flex-col gap-4">
                            <p class="text-[14px] text-slate-600">
                                {{
                                    invoice.status === 'unpaid'
                                        ? 'Your enrollment has been approved. Complete your payment to activate your enrollment.'
                                : invoice.status === 'pending_verification'
                                    ? 'Your payment is currently being verified.'
                                    : invoice.status === 'paid'
                                        ? 'Your initial payment has been successfully verified.'
                                        : 'This invoice has been cancelled.'
                                }}
                            </p>

                            <p v-if="paymentAttemptsLoading" class="text-[14px] text-slate-600" role="status">
                                Loading payment attempts...
                            </p>

                            <div v-else-if="paymentError"
                                class="rounded-xl border border-red-200 bg-red-50 p-4 text-[14px] text-alert">
                                <p role="alert">{{ paymentError }}</p>
                                <button type="button"
                                    class="mt-3 font-semibold underline"
                                    @click="loadPaymentAttempts(invoice.id, detailLoadSequence)">
                                    Retry loading payment status
                                </button>
                            </div>

                            <section v-else-if="paymentNotice === 'rejected'" role="alert"
                                class="rounded-xl border border-red-300 bg-red-50 p-4 text-red-900">
                                <h3 class="font-bold">Payment Rejected</h3>
                                <p class="mt-1 text-[14px] leading-6">
                                    The previous payment could not be verified. Please review the reason and submit a new payment attempt.
                                </p>
                                <p v-if="latestPayment?.rejection_reason"
                                    class="mt-2 wrap-break-word text-[14px] font-medium">
                                    Reason: {{ latestPayment.rejection_reason }}
                                </p>
                            </section>

                            <section v-else-if="paymentNotice === 'pending'" role="status"
                                class="rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-900">
                                <h3 class="font-bold">Payment Verification Pending</h3>
                                <p class="mt-1 text-[14px] leading-6">
                                    Your latest payment attempt is waiting for administrator verification. Please wait before submitting another payment.
                                </p>
                            </section>

                            <section v-else-if="paymentNotice === 'verified'" role="status"
                                class="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
                                <h3 class="font-bold">Payment Successful</h3>
                                <p class="mt-1 text-[14px] leading-6">
                                    Your latest payment attempt has been verified and the invoice is paid.
                                </p>
                            </section>

                            <section v-else-if="paymentNotice === 'invoice-paid'" role="status"
                                class="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
                                <h3 class="font-bold">Invoice Paid</h3>
                                <p class="mt-1 text-[14px] leading-6">
                                    This invoice has been paid.
                                </p>
                            </section>

                            <button type="button"
                                class="flex w-full items-center justify-center gap-2 rounded-xl  px-5 py-3 font-semibold text-black transition hover:opacity-90 border border-black"
                                @click="router.push({
                                    name: 'student.invoice-detail',
                                    params: { invoiceId: invoice.id }
                                })">
                                <ReceiptText :size="17" />
                                View Invoice Details
                            </button>
                            <button type="button" v-if="canStartPayment"
                                class="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 font-semibold text-surface transition hover:opacity-90"
                                @click="router.push({
                                    name: 'student.payment',
                                    params: { invoiceId: invoice.id }
                                })">
                                <ReceiptText :size="17" />
                                {{ latestPayment?.status === 'rejected' ? 'Try Again' : 'Pay Now' }}
                            </button>
                        </div>
                    </div>
                </section>

                <!-- Course information -->
                <section class="mt-8">
                    <h2 class="text-xl font-bold text-text-primary">
                        Course Information
                    </h2>

                    <div class="mt-4 rounded-2xl border border-text-primary bg-surface p-5 sm:p-6">
                        <div class="flex items-center gap-4">
                            <div
                                class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/25 text-accent">
                                <graduation-cap />
                            </div>

                            <div class="min-w-0">
                                <p class="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                                    Course
                                </p>
                                <h3 class="mt-1 text-lg font-bold text-text-primary">
                                    {{ course?.name ?? 'Course unavailable' }}
                                </h3>

                                <p class="mt-1 text-[14px] text-text-secondary">
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
                    <h2 class="text-xl font-bold text-text-primary">
                        Fee Information
                    </h2>

                    <div class="mt-4 grid gap-4 sm:grid-cols-2">
                        <div class="rounded-2xl border border-text-primary bg-surface p-5">
                            <div class="flex items-center gap-2 text-[14px] text-text-secondary">
                                <ReceiptText :size="16" />
                                Registration Fee
                            </div>
                            <p class="mt-3 text-xl font-bold text-text-primary">
                                {{ formatCurrency(program?.registration_fee) }}
                            </p>
                        </div>

                        <div class="rounded-2xl border border-text-primary bg-surface p-5">
                            <div class="flex items-center gap-2 text-[14px] text-text-secondary">
                                <CalendarDays :size="16" />
                                Monthly Fee
                            </div>
                            <p class="mt-3 text-xl font-bold text-text-primary">
                                {{ formatCurrency(program?.monthly_fee) }}
                            </p>
                        </div>
                    </div>
                </section>

                <!-- Student information -->
                <section class="mt-8">
                    <h2 class="text-xl font-bold text-text-primary">
                        Student Information
                    </h2>

                    <div class="mt-4 grid gap-4 sm:grid-cols-2">
                        <div class="rounded-2xl border border-text-primary bg-surface p-5">
                            <p class="text-xs font-medium uppercase tracking-wider text-text-secondary">
                                Full Name
                            </p>
                            <p class="mt-2 wrap-break-word font-semibold text-text-primary">
                                {{ enrollment.fullname }}
                            </p>
                        </div>

                        <div class="rounded-2xl border border-text-primary bg-surface p-5">
                            <p class="text-xs font-medium uppercase tracking-wider text-text-secondary">
                                Phone Number
                            </p>
                            <p class="mt-2 wrap-break-word font-semibold text-text-primary">
                                {{ enrollment.phone }}
                            </p>
                        </div>

                        <div class="rounded-2xl border border-text-primary bg-surface p-5">
                            <p class="text-xs font-medium uppercase tracking-wider text-text-secondary">
                                Education Level
                            </p>
                            <p class="mt-2 wrap-break-word font-semibold text-text-primary">
                                {{ enrollment.education_level }}
                            </p>
                        </div>

                        <div class="rounded-2xl border border-text-primary bg-surface p-5">
                            <p class="text-xs font-medium uppercase tracking-wider text-text-secondary">
                                School / Institution
                            </p>
                            <p class="mt-2 wrap-break-word font-semibold text-text-primary">
                                {{ enrollment.school_name }}
                            </p>
                        </div>

                        <div class="rounded-2xl border border-text-primary bg-surface p-5 sm:col-span-2">
                            <p class="text-xs font-medium uppercase tracking-wider text-text-secondary">
                                Address
                            </p>
                            <p class="mt-2 surfacespace-pre-line wrap-break-word font-semibold leading-6 text-text-primary">
                                {{ enrollment.address }}
                            </p>
                        </div>
                    </div>
                </section>

                <!-- Enrollment metadata -->
                <section class="mt-8">
                    <h2 class="text-xl font-bold text-text-primary">
                        Enrollment Information
                    </h2>

                    <div class="mt-4 rounded-2xl border border-text-primary bg-surface p-5 sm:p-6">
                        <div class="flex items-start gap-3">
                            <div class="rounded-xl bg-accent/25 p-3 text-accent">
                                <Ticket />
                            </div>

                            <div class="min-w-0">
                                <p class="text-xs font-medium uppercase tracking-wider text-text-secondary">
                                    Enrollment ID
                                </p>
                                <p class="mt-1 break-all font-semibold text-text-primary">
                                    {{ enrollment.id }}
                                </p>
                            </div>
                        </div>

                        <div class="mt-5 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
                            <div>
                                <p class="text-xs text-text-secondary">Submitted</p>
                                <p class="mt-1 text-[14px] font-medium text-text-primary">
                                    {{ formatDate(enrollment.created_at) }}
                                </p>
                            </div>

                            <div>
                                <p class="text-xs text-text-secondary">Enrolled At</p>
                                <p class="mt-1 text-[14px] font-medium text-text-primary">
                                    {{ formatDate(enrollment.enrolled_at) }}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Feedback if an action fails -->
                <p v-if="pageError" role="alert"
                    class="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-[14px] text-alert">
                    {{ pageError }}
                </p>

                <!-- Status-specific actions -->
                <section class="mt-8 space-y-4">
                    <button v-if="status === 'active'" type="button"
                        class="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3.5 font-semibold text-surface transition hover:bg-accent/90"
                        @click="viewMyCourse">
                        <BookOpen :size="16" />
                        View My Course
                    </button>

                    <div v-if="status === 'pending'" class="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                        <div class="flex items-start gap-3">
                            <Info color="#b45309" />
                            <p class="text-[14px] leading-6 text-amber-900">
                                Please wait while the course administrator
                                reviews your enrollment. You can return here
                                later to check its status.
                            </p>
                        </div>
                    </div>

                    <button v-if="status === 'pending'" type="button"
                        class="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-surface px-5 py-3.5 font-semibold text-alert transition hover:bg-red-50 disabled:opacity-60"
                        :disabled="cancelling" @click="showCancelConfirmation = true">
                        Cancel Enrollment
                    </button>

                    <button type="button"
                        class="w-full rounded-xl border border-slate-300 bg-surface px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
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
                class="w-full max-w-md rounded-t-3xl bg-surface p-6 shadow-2xl sm:rounded-2xl">
                <div class="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-alert">
                    <TriangleAlert />
                </div>

                <h2 id="cancel-title" class="mt-4 text-xl font-bold text-text-primary">
                    Cancel Enrollment?
                </h2>

                <p class="mt-2 text-[14px] leading-6 text-slate-600">
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
                        class="flex-1 rounded-xl bg-alert px-4 py-3 font-semibold text-surface hover:bg-alert disabled:opacity-60"
                        :disabled="cancelling" @click="cancelEnrollment">
                        {{ cancelling ? 'Cancelling...' : 'Yes, Cancel' }}
                    </button>
                </div>
            </section>
        </div>
    </main>
</template>
