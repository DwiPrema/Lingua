<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useInvoiceStore } from "@/stores/invoice_stores";
import { useEnrollmentStores } from "@/stores/enrollments_stores";
import { useCourseStores } from "@/stores/course_stores";
import { useCourseProgramStore } from "@/stores/course_program_stores";

import { formatCurrency } from "@/constant/format_currency";

import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    Clock3,
    GraduationCap,
    ReceiptText,
    TriangleAlert,
} from "@lucide/vue";
import { Invoice } from "@/types/invoice_type";
import { Course } from "@/types/course_type";
import { Programs } from "@/types/program_type";
import { Enrollment } from "@/types/enrollment_type";

const route = useRoute();
const router = useRouter();

const invoiceStore = useInvoiceStore();
const enrollmentStore = useEnrollmentStores();
const courseStore = useCourseStores();
const courseProgramStore = useCourseProgramStore();

const invoice = ref<Invoice | null>(null);
const enrollment = ref<Enrollment | null>(null);
const course = ref<Course | null>(null);
const program = ref<Programs | null>(null);

const loadingPage = ref<boolean>(true);
const pageError = ref<string>("");

const invoiceStatus = computed(() => {
    const statuses = {
        unpaid: {
            label: "Unpaid",
            description: "Please complete your payment to activate your enrollment.",
            icon: Clock3,
            classes: "bg-warning/15 text-warning border-warning/60",
            badge: "bg-warning/30 text-warning",
        },
        pending_verification: {
            label: "Pending Verification",
            description: "Your payment has been submitted and is waiting for verification.",
            icon: Clock3,
            classes: "bg-secondary/15 text-secondary border-secondary/60",
            badge: "bg-secondary/30 text-secondary",
        },
        paid: {
            label: "Paid",
            description: "Your payment has been successfully verified.",
            icon: CheckCircle2,
            classes: "bg-success/15 text-success border-success/60",
            badge: "bg-success/30 text-success",
        },
        cancelled: {
            label: "Cancelled",
            description: "This invoice is no longer available for payment.",
            icon: TriangleAlert,
            classes: "bg-slate-50 text-slate-600 border-text-primary",
            badge: "bg-slate-100 text-slate-700",
        },
    };

    return statuses[invoice.value?.status ?? "unpaid"] ?? statuses.unpaid;
});

function formatDate(value: string | null) {
    if (!value) return "Not available";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Not available";
    }

    return new Intl.DateTimeFormat("en-ID", {
        dateStyle: "medium",
    }).format(date);
}

onMounted(loadInvoiceDetail);

async function loadInvoiceDetail() {
    loadingPage.value = true;
    pageError.value = "";

    try {
        const invoiceId = String(route.params.invoiceId ?? "");

        if (!invoiceId) {
            throw new Error("Invoice ID is missing.");
        }

        const result = await invoiceStore.getInvoiceById(invoiceId);

        if (!result) {
            throw new Error("Invoice not found.");
        }

        invoice.value = result;

        enrollment.value = await enrollmentStore.fetchEnrollmentById(
            result.enrollment_id
        );

        if (!enrollment.value) {
            throw new Error("Enrollment information not found.");
        }

        course.value = await courseStore.fetchCourseById(
            enrollment.value.course_id
        );

        const programs = await courseProgramStore.getAllCourseProgram(
            enrollment.value.course_id
        );

        program.value = programs.find(
            (item) =>
                String(item.id) === String(enrollment.value?.program_id)
        ) ?? null;

    } catch (err: unknown) {
        pageError.value =
            err instanceof Error
                ? err.message
                : "Unable to load invoice details.";
    } finally {
        loadingPage.value = false;
    }
}
</script>

<template>
    <main class="min-h-screen py-8 sm:py-10">
        <div class="mx-auto">

            <!-- Back Button -->
            <button type="button"
                class="mb-6 inline-flex items-center gap-2 text-[14px] font-semibold text-text-secondary transition hover:text-text-primary"
                @click="router.back()">
                <ArrowLeft :size="17" />
                Back
            </button>

            <!-- Loading -->
            <div v-if="loadingPage" class="animate-pulse space-y-5">
                <div class="h-36 rounded-2xl bg-slate-200" />
                <div class="h-64 rounded-2xl bg-slate-200" />
                <div class="h-48 rounded-2xl bg-slate-200" />
            </div>

            <!-- Error -->
            <section v-else-if="pageError" class="rounded-2xl border border-red-200 bg-white p-8 text-center">
                <h1 class="text-xl font-bold text-text-primary">
                    Unable to Load Invoice
                </h1>

                <p class="mt-2 text-[14px] text-alert/85">
                    {{ pageError }}
                </p>

                <button type="button" class="mt-5 rounded-xl bg-text-primary px-5 py-3 text-[14px] font-semibold text-white"
                    @click="loadInvoiceDetail">
                    Try Again
                </button>
            </section>

            <template v-else-if="invoice">

                <!-- Invoice Header -->
                <section class="rounded-2xl border p-6 shadow-sm sm:p-8" :class="invoiceStatus.classes">
                    <div class="flex items-center gap-3">
                        <component :is="invoiceStatus.icon" :size="30" />

                        <div>
                            <h1 class="text-2xl font-extrabold">
                                Invoice Details
                            </h1>

                            <p class="mt-1 text-[14px] opacity-90">
                                {{ invoiceStatus.description }}
                            </p>
                        </div>
                    </div>

                    <span class="mt-5 inline-flex rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider"
                        :class="invoiceStatus.badge">
                        {{ invoiceStatus.label }}
                    </span>
                </section>

                <!-- Invoice Information -->
                <section class="mt-6 rounded-2xl border border-text-primary bg-accent/80 p-6 sm:p-8">
                    <div class="flex items-start justify-between gap-4">
                        <div>
                            <p class="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                                Invoice Number
                            </p>

                            <h2 class="mt-2 break-all text-lg font-bold text-text-primary">
                                {{ invoice.invoice_number }}
                            </h2>
                        </div>

                        <div class="rounded-xl bg-surface p-3 text-accent">
                            <ReceiptText :size="25" />
                        </div>
                    </div>

                    <div class="mt-6 grid gap-5 border-t border-slate-100 pt-5 sm:grid-cols-2">
                        <div>
                            <p class="text-xs text-text-secondary">Invoice Date</p>
                            <p class="mt-1 font-semibold text-text-primary">
                                {{ formatDate(invoice.created_at) }}
                            </p>
                        </div>

                        <div>
                            <p class="text-xs text-text-secondary">Due Date</p>
                            <p class="mt-1 font-semibold text-text-primary">
                                {{ formatDate(invoice.due_at) }}
                            </p>
                        </div>
                    </div>
                </section>

                <!-- Course Information -->
                <section class="mt-6 rounded-2xl border border-text-primary bg-white p-6">
                    <h2 class="text-lg font-bold text-text-primary">
                        Course Information
                    </h2>

                    <div class="mt-4 flex items-center gap-4">
                        <div
                            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
                            <GraduationCap :size="25" />
                        </div>

                        <div class="min-w-0">
                            <p class="text-xs text-text-secondary">Course</p>
                            <p class="font-bold text-text-primary">
                                {{ course?.name ?? "Course unavailable" }}
                            </p>

                            <p class="mt-1 text-[14px] text-text-secondary">
                                Program:
                                <span class="font-semibold text-slate-700">
                                    {{ program?.name ?? "Program unavailable" }}
                                </span>
                            </p>
                        </div>
                    </div>
                </section>

                <!-- Payment Breakdown -->
                <section class="mt-6 rounded-2xl border border-text-primary bg-white p-6 sm:p-8">
                    <h2 class="text-lg font-bold text-text-primary">
                        Payment Breakdown
                    </h2>

                    <div class="mt-5 space-y-4">
                        <div class="flex justify-between gap-4">
                            <div>
                                <p class="font-medium text-text-primary">
                                    Registration Fee
                                </p>
                                <p class="text-xs text-text-secondary">
                                    One-time registration fee
                                </p>
                            </div>

                            <p class="font-semibold text-text-primary">
                                {{ formatCurrency(invoice.registration_fee) }}
                            </p>
                        </div>

                        <div class="flex justify-between gap-4">
                            <div>
                                <p class="font-medium text-text-primary">
                                    Monthly Fee
                                </p>
                                <p class="text-xs text-text-secondary">
                                    First month payment
                                </p>
                            </div>

                            <p class="font-semibold text-text-primary">
                                {{ formatCurrency(invoice.monthly_fee) }}
                            </p>
                        </div>

                        <div v-if="invoice.invoice_type === 'monthly'"
                            class="flex items-center gap-2 text-[14px] text-text-secondary">
                            <CalendarDays :size="16" />
                            Billing period:
                            {{ formatDate(invoice.billing_period_start) }}
                            -
                            {{ formatDate(invoice.billing_period_end) }}
                        </div>

                        <div class="border-t border-dashed border-slate-300 pt-5">
                            <div class="flex items-center justify-between gap-4">
                                <p class="font-bold text-text-primary">
                                    Total Amount
                                </p>

                                <p class="text-2xl font-extrabold text-text-primary">
                                    {{ formatCurrency(invoice.total_amount) }}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Payment Notice -->
                <section v-if="invoice.status === 'unpaid'"
                    class="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                    <div class="flex items-start gap-3">
                        <Clock3 class="shrink-0 text-amber-700" :size="20" />

                        <div>
                            <h3 class="font-bold text-amber-900">
                                Payment Required
                            </h3>

                            <p class="mt-1 text-[14px] leading-6 text-amber-800">
                                Your enrollment has been approved.
                                Complete this payment to activate your enrollment.
                            </p>
                        </div>
                    </div>
                </section>

                <section v-else-if="invoice.status === 'pending_verification'"
                    class="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
                    <h3 class="font-bold text-blue-900">
                        Payment Under Review
                    </h3>

                    <p class="mt-1 text-[14px] leading-6 text-blue-800">
                        Your payment proof has been submitted.
                        Please wait for the course administrator to verify it.
                    </p>
                </section>

                <section v-else-if="invoice.status === 'paid'"
                    class="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                    <h3 class="font-bold text-emerald-900">
                        Payment Completed
                    </h3>

                    <p class="mt-1 text-[14px] leading-6 text-emerald-800">
                        Your payment has been verified successfully.
                        Thank you!
                    </p>
                </section>

            </template>
        </div>
    </main>
</template>
