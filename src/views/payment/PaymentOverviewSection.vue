
<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";

import { formatCurrency } from "@/constant/format_currency";
import { usePaymentStore } from "@/stores/payment_stores";

import type { Invoice, InvoiceStatus } from "@/types/invoice_type";
import type { Payment, PaymentStatus } from "@/types/payment_type";

// =====================================================
// PROPS & EMITS
// =====================================================

const props = defineProps<{
    invoices: Invoice[];
    loading?: boolean;
    error?: string | null;
}>();

const emit = defineEmits<{
    (event: "retry"): void;
    (event: "verify", payment: Payment): void;
    (event: "reject", payment: Payment, reason: string): void;
}>();

// =====================================================
// STORE
// =====================================================

const paymentStore = usePaymentStore();
const { payments } = storeToRefs(paymentStore);

// =====================================================
// PROOF STATE
// =====================================================

const proofUrls = ref<Record<string, string>>({});
const proofLoading = ref<Record<string, boolean>>({});
const proofErrors = ref<Record<string, string>>({});

const selectedProof = ref<Payment | null>(null);

async function loadProofUrl(payment: Payment): Promise<void> {
    if (!payment.proof_path) return;

    if (proofUrls.value[payment.id]) return;

    if (proofLoading.value[payment.id]) return;

    proofLoading.value[payment.id] = true;
    delete proofErrors.value[payment.id];

    try {
        const url = await paymentStore.getPaymentProofUrl(
            payment.proof_path,
        );

        proofUrls.value[payment.id] = url;
    } catch (err) {
        proofErrors.value[payment.id] =
            err instanceof Error
                ? err.message
                : "Failed to load payment proof.";
    } finally {
        proofLoading.value[payment.id] = false;
    }
}

watch(
    payments,
    async (paymentList) => {
        await Promise.all(
            paymentList
                .filter((payment) => payment.proof_path)
                .map((payment) => loadProofUrl(payment)),
        );
    },
    { immediate: true },
);

function getProofUrl(payment: Payment): string | undefined {
    return proofUrls.value[payment.id];
}

function isImageProof(payment: Payment): boolean {
    return /\.(png|jpe?g|webp)$/i.test(
        payment.proof_path ?? "",
    );
}

function openProof(payment: Payment): void {
    selectedProof.value = payment;

    void loadProofUrl(payment);
}

function closeProof(): void {
    selectedProof.value = null;
}

// =====================================================
// REJECTION MODAL
// =====================================================

const rejectionTarget = ref<Payment | null>(null);
const rejectionReason = ref("");

function openRejectForm(payment: Payment): void {
    rejectionTarget.value = payment;
    rejectionReason.value = "";
}

function closeRejectForm(): void {
    rejectionTarget.value = null;
    rejectionReason.value = "";
}

function submitRejection(): void {
    const payment = rejectionTarget.value;
    const reason = rejectionReason.value.trim();

    if (!payment || !reason) return;

    emit("reject", payment, reason);
    closeRejectForm();
}

// =====================================================
// PAYMENT HISTORY
// =====================================================

function getPayments(invoiceId: string): Payment[] {
    return payments.value
        .filter((payment) => payment.invoice_id === invoiceId)
        .sort(
            (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime(),
        );
}

// =====================================================
// SUMMARY
// =====================================================

const totalInvoices = computed(() => props.invoices.length);

const totalPaid = computed(() =>
    props.invoices
        .filter((invoice) => invoice.status === "paid")
        .reduce(
            (total, invoice) => total + invoice.total_amount,
            0,
        ),
);

const totalOutstanding = computed(() =>
    props.invoices
        .filter((invoice) => invoice.status === "unpaid")
        .reduce(
            (total, invoice) => total + invoice.total_amount,
            0,
        ),
);

const totalPending = computed(() =>
    props.invoices
        .filter(
            (invoice) =>
                invoice.status === "pending_verification",
        )
        .reduce(
            (total, invoice) => total + invoice.total_amount,
            0,
        ),
);

// =====================================================
// DATE FORMATTER
// =====================================================

function formatDate(value?: string | null): string {
    if (!value) return "Not available";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Not available";
    }

    return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).format(date);
}

// =====================================================
// STATUS HELPERS
// =====================================================

function invoiceStatusLabel(status: InvoiceStatus): string {
    const labels: Record<InvoiceStatus, string> = {
        unpaid: "Unpaid",
        pending_verification: "Waiting Verification",
        paid: "Paid",
        cancelled: "Cancelled",
    };

    return labels[status];
}

function invoiceStatusClass(status: InvoiceStatus): string {
    const classes: Record<InvoiceStatus, string> = {
        unpaid: "bg-orange-100 text-orange-700",
        pending_verification: "bg-blue-100 text-blue-700",
        paid: "bg-green-100 text-green-700",
        cancelled: "bg-gray-100 text-gray-600",
    };

    return classes[status];
}

function paymentStatusLabel(status: PaymentStatus): string {
    const labels: Record<PaymentStatus, string> = {
        pending_verification: "Pending Verification",
        verified: "Verified",
        rejected: "Rejected",
    };

    return labels[status];
}

function paymentStatusClass(status: PaymentStatus): string {
    const classes: Record<PaymentStatus, string> = {
        pending_verification: "bg-blue-100 text-blue-700",
        verified: "bg-green-100 text-green-700",
        rejected: "bg-red-100 text-alert",
    };

    return classes[status];
}

function paymentMethodLabel(
    method: Payment["payment_method"],
): string {
    return method === "bank_transfer"
        ? "Bank Transfer"
        : "QRIS";
}

function invoiceTypeLabel(
    type: Invoice["invoice_type"],
): string {
    return type === "initial"
        ? "Initial Payment"
        : "Monthly Payment";
}
</script>

<template>
    <section class="space-y-6">

        <!-- HEADER -->
        <div>
            <h2 class="text-lg font-bold text-gray-900">
                Payment Overview
            </h2>

            <p class="mt-1 text-[14px] text-gray-500">
                Monitor invoices, payment status, and payment history.
            </p>
        </div>

        <!-- LOADING -->
        <div
            v-if="loading"
            class="rounded-xl border border-gray-200 bg-white py-12 text-center"
        >
            <p class="text-[14px] text-gray-500">
                Loading payment information...
            </p>
        </div>

        <!-- ERROR -->
        <div
            v-else-if="error"
            class="rounded-xl border border-red-200 bg-red-50 p-5"
        >
            <p class="font-semibold text-alert">
                Failed to load payment information
            </p>

            <p class="mt-1 text-[14px] text-alert/85">
                {{ error }}
            </p>

            <button
                type="button"
                @click="emit('retry')"
                class="mt-3 rounded-lg bg-alert/85 px-4 py-2 text-[14px] font-medium text-white"
            >
                Try Again
            </button>
        </div>

        <template v-else>

            <!-- SUMMARY -->
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <div class="rounded-xl border border-gray-200 bg-white p-5">
                    <p class="text-[14px] text-gray-500">
                        Total Invoices
                    </p>

                    <p class="mt-2 text-2xl font-bold text-gray-900">
                        {{ totalInvoices }}
                    </p>
                </div>

                <div class="rounded-xl border border-gray-200 bg-white p-5">
                    <p class="text-[14px] text-gray-500">
                        Total Paid
                    </p>

                    <p class="mt-2 text-xl font-bold text-green-700">
                        {{ formatCurrency(totalPaid) }}
                    </p>
                </div>

                <div class="rounded-xl border border-gray-200 bg-white p-5">
                    <p class="text-[14px] text-gray-500">
                        Outstanding
                    </p>

                    <p class="mt-2 text-xl font-bold text-orange-600">
                        {{ formatCurrency(totalOutstanding) }}
                    </p>
                </div>

                <div class="rounded-xl border border-gray-200 bg-white p-5">
                    <p class="text-[14px] text-gray-500">
                        Pending Verification
                    </p>

                    <p class="mt-2 text-xl font-bold text-blue-700">
                        {{ formatCurrency(totalPending) }}
                    </p>
                </div>

            </div>

            <!-- EMPTY STATE -->
            <div
                v-if="invoices.length === 0"
                class="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center"
            >
                <h3 class="font-semibold text-gray-800">
                    No invoices yet
                </h3>

                <p class="mt-2 text-[14px] text-gray-500">
                    No payment invoices have been created for this enrollment.
                </p>
            </div>

            <!-- INVOICE LIST -->
            <div v-else class="space-y-4">

                <div
                    v-for="invoice in invoices"
                    :key="invoice.id"
                    class="overflow-hidden rounded-xl border border-gray-200 bg-white"
                >

                    <!-- INVOICE HEADER -->
                    <div class="border-b border-gray-100 p-5">

                        <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                            <div>
                                <div class="flex flex-wrap items-center gap-2">
                                    <h3 class="font-bold text-gray-900">
                                        {{ invoice.invoice_number }}
                                    </h3>

                                    <span class="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                                        {{ invoiceTypeLabel(invoice.invoice_type) }}
                                    </span>
                                </div>

                                <p class="mt-2 text-[14px] text-gray-500">
                                    Created: {{ formatDate(invoice.created_at) }}
                                </p>

                                <p class="mt-1 text-[14px] text-gray-500">
                                    Due date: {{ formatDate(invoice.due_at) }}
                                </p>
                            </div>

                            <div class="sm:text-right">
                                <p class="text-xl font-bold text-gray-900">
                                    {{ formatCurrency(invoice.total_amount) }}
                                </p>

                                <span
                                    class="mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold"
                                    :class="invoiceStatusClass(invoice.status)"
                                >
                                    {{ invoiceStatusLabel(invoice.status) }}
                                </span>
                            </div>

                        </div>

                        <!-- INVOICE BREAKDOWN -->
                        <div class="mt-5 rounded-lg bg-gray-50 p-4">

                            <div class="flex justify-between gap-4 text-[14px]">
                                <span class="text-gray-500">
                                    Registration Fee
                                </span>

                                <span class="font-medium text-gray-800">
                                    {{ formatCurrency(invoice.registration_fee) }}
                                </span>
                            </div>

                            <div class="mt-3 flex justify-between gap-4 text-[14px]">
                                <span class="text-gray-500">
                                    Monthly Fee
                                </span>

                                <span class="font-medium text-gray-800">
                                    {{ formatCurrency(invoice.monthly_fee) }}
                                </span>
                            </div>

                            <div class="mt-3 flex justify-between gap-4 border-t border-gray-200 pt-3">
                                <span class="font-semibold text-gray-900">
                                    Total
                                </span>

                                <span class="font-bold text-gray-900">
                                    {{ formatCurrency(invoice.total_amount) }}
                                </span>
                            </div>

                        </div>
                    </div>

                    <!-- PAYMENT ATTEMPTS -->
                    <div class="p-5">

                        <div class="mb-4">
                            <h4 class="font-semibold text-gray-900">
                                Payment History
                            </h4>

                            <p class="mt-1 text-xs text-gray-500">
                                {{ getPayments(invoice.id).length }} payment attempt(s)
                            </p>
                        </div>

                        <div
                            v-if="getPayments(invoice.id).length === 0"
                            class="rounded-lg border border-dashed border-gray-200 p-5 text-center"
                        >
                            <p class="text-[14px] text-gray-500">
                                No payment attempts submitted.
                            </p>
                        </div>

                        <div v-else class="space-y-4">

                            <div
                                v-for="(payment, index) in getPayments(invoice.id)"
                                :key="payment.id"
                                class="rounded-lg border border-gray-200 p-4"
                            >

                                <!-- PAYMENT HEADER -->
                                <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                                    <div>
                                        <p class="font-semibold text-gray-900">
                                            Payment Attempt #{{ getPayments(invoice.id).length - index }}
                                        </p>

                                        <p class="mt-1 text-[14px] text-gray-500">
                                            {{ paymentMethodLabel(payment.payment_method) }}
                                        </p>

                                        <p class="mt-1 text-xs text-gray-500">
                                            Submitted: {{ formatDate(payment.created_at) }}
                                        </p>
                                    </div>

                                    <div class="sm:text-right">
                                        <p class="font-bold text-gray-900">
                                            {{ formatCurrency(payment.amount) }}
                                        </p>

                                        <span
                                            class="mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold"
                                            :class="paymentStatusClass(payment.status)"
                                        >
                                            {{ paymentStatusLabel(payment.status) }}
                                        </span>
                                    </div>

                                </div>

                                <!-- PAYMENT PROOF -->
                                <div class="mt-4 border-t border-gray-100 pt-4">

                                    <div class="flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <p class="text-[14px] font-semibold text-gray-800">
                                                Payment Proof
                                            </p>

                                            <p class="mt-1 text-xs text-gray-500">
                                                Review the submitted payment evidence.
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            @click="openProof(payment)"
                                            :disabled="!payment.proof_path"
                                            class="rounded-lg border border-gray-300 px-3 py-2 text-[14px] font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            View Proof
                                        </button>
                                    </div>

                                    <div
                                        v-if="proofLoading[payment.id]"
                                        class="mt-3 rounded-lg bg-gray-50 p-4 text-[14px] text-gray-500"
                                    >
                                        Loading payment proof...
                                    </div>

                                    <div
                                        v-else-if="proofErrors[payment.id]"
                                        class="mt-3 rounded-lg bg-red-50 p-3 text-[14px] text-alert/85"
                                    >
                                        {{ proofErrors[payment.id] }}
                                    </div>

                                    <div
                                        v-else-if="getProofUrl(payment) && isImageProof(payment)"
                                        class="mt-3 overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                                    >
                                        <img
                                            :src="getProofUrl(payment)"
                                            alt="Payment proof"
                                            class="max-h-72 w-full object-contain"
                                        />
                                    </div>

                                    <p
                                        v-else-if="!payment.proof_path"
                                        class="mt-3 text-[14px] text-gray-500"
                                    >
                                        No payment proof available.
                                    </p>

                                    <p
                                        v-else
                                        class="mt-3 text-[14px] text-gray-500"
                                    >
                                        Document proof. Select View Proof to preview it.
                                    </p>

                                </div>

                                <!-- REJECTION REASON -->
                                <div
                                    v-if="payment.status === 'rejected' && payment.rejection_reason"
                                    class="mt-4 rounded-lg border border-red-200 bg-red-50 p-3"
                                >
                                    <p class="text-[14px] font-semibold text-alert">
                                        Rejection Reason
                                    </p>

                                    <p class="mt-1 text-[14px] text-alert/85">
                                        {{ payment.rejection_reason }}
                                    </p>
                                </div>

                                <!-- VERIFICATION ACTIONS -->
                                <div
                                    v-if="payment.status === 'pending_verification'"
                                    class="mt-4 flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-4"
                                >
                                    <button
                                        type="button"
                                        @click="openRejectForm(payment)"
                                        class="rounded-lg border border-red-200 px-4 py-2 text-[14px] font-semibold text-alert/85 hover:bg-red-50"
                                    >
                                        Reject Payment
                                    </button>

                                    <button
                                        type="button"
                                        @click="emit('verify', payment)"
                                        class="rounded-lg bg-green-600 px-4 py-2 text-[14px] font-semibold text-white hover:bg-green-700"
                                    >
                                        Verify Payment
                                    </button>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>

        <!-- PROOF PREVIEW MODAL -->
        <div
            v-if="selectedProof"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            @click.self="closeProof"
        >
            <div class="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-xl">

                <div class="flex items-center justify-between border-b border-gray-200 p-4">
                    <h3 class="font-bold text-gray-900">
                        Payment Proof
                    </h3>

                    <button
                        type="button"
                        @click="closeProof"
                        class="rounded-lg px-3 py-1 text-gray-500 hover:bg-gray-100"
                    >
                        Close
                    </button>
                </div>

                <div class="max-h-[75vh] overflow-auto bg-gray-50 p-4">

                    <div
                        v-if="proofLoading[selectedProof.id]"
                        class="py-12 text-center text-[14px] text-gray-500"
                    >
                        Loading proof...
                    </div>

                    <div
                        v-else-if="proofErrors[selectedProof.id]"
                        class="py-12 text-center text-[14px] text-alert/85"
                    >
                        {{ proofErrors[selectedProof.id] }}
                    </div>

                    <template v-else-if="getProofUrl(selectedProof)">

                        <img
                            v-if="isImageProof(selectedProof)"
                            :src="getProofUrl(selectedProof)"
                            alt="Payment proof full preview"
                            class="mx-auto max-h-[65vh] w-auto object-contain"
                        />

                        <iframe
                            v-else
                            :src="getProofUrl(selectedProof)"
                            title="Payment proof document"
                            class="h-[65vh] w-full rounded-lg border border-gray-200 bg-white"
                        />

                    </template>

                </div>
            </div>
        </div>

        <!-- REJECTION MODAL -->
        <div
            v-if="rejectionTarget"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            @click.self="closeRejectForm"
        >
            <div class="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">

                <h3 class="text-lg font-bold text-gray-900">
                    Reject Payment
                </h3>

                <p class="mt-2 text-[14px] text-gray-500">
                    Please provide a reason for rejecting this payment.
                </p>

                <textarea
                    v-model="rejectionReason"
                    rows="4"
                    placeholder="Enter rejection reason..."
                    class="mt-4 w-full rounded-lg border border-gray-300 p-3 text-[14px] outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />

                <div class="mt-4 flex justify-end gap-2">

                    <button
                        type="button"
                        @click="closeRejectForm"
                        class="rounded-lg border border-gray-300 px-4 py-2 text-[14px] font-medium text-gray-700"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        @click="submitRejection"
                        :disabled="!rejectionReason.trim()"
                        class="rounded-lg bg-alert/85 px-4 py-2 text-[14px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Reject Payment
                    </button>

                </div>
            </div>
        </div>

    </section>
</template>
