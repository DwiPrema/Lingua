<script setup lang="ts">
import { computed, onUnmounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useInvoiceStore } from "@/stores/invoice_stores";
import { usePaymentStore } from "@/stores/payment_stores";

import PaymentForm from "@/views/payment/PaymentForm.vue";
import type { PaymentPayload } from "@/types/payment_type";

const route = useRoute();
const router = useRouter();

const invoiceStore = useInvoiceStore();
const paymentStore = usePaymentStore();

// =====================================================
// State
// =====================================================

const invoiceId = computed(() => {
    const param = route.params.invoiceId;
    return typeof param === "string" ? param : "";
});

const invoice = computed(() => {
    return invoiceStore.selectedInvoice;
});

const paymentAccount = computed(() => {
    return paymentStore.paymentAccount;
});

const invoicePaymentMessage = computed(() => {
    switch (invoice.value?.status) {
        case "pending_verification":
            return "Your payment is waiting for verification. Please wait before submitting another attempt.";
        case "paid":
            return "This invoice has already been paid.";
        case "cancelled":
            return "This invoice is no longer available for payment.";
        default:
            return "";
    }
});

// =====================================================
// Fetch Data
// =====================================================

async function loadPaymentData(): Promise<void> {
    paymentStore.clearPaymentAccount();
    paymentStore.clearError();

    if (!invoiceId.value) {
        invoiceStore.clearSelectedInvoice();
        return;
    }

    try {
        // Fetch invoice
        const loadedInvoice = await invoiceStore.getInvoiceById(invoiceId.value);

        if (!loadedInvoice || loadedInvoice.status !== "unpaid") {
            return;
        }

        // Fetch organization payment account
        await paymentStore.getPaymentAccountByInvoiceId(
            invoiceId.value
        );

    } catch (err) {
        console.error("Failed to load payment data:", err);
    }
}

async function handlePaymentSubmit(
    payload: PaymentPayload
): Promise<void> {
    try {
        await paymentStore.createPayment(payload);

        router.push({
            name: "student.invoice-detail",
            params: {
                invoiceId: payload.invoice_id,
            },
        });

    } catch (error) {
        console.error("Failed to submit payment:", error);
    }
}

// =====================================================
// Lifecycle
// =====================================================

watch(invoiceId, () => {
    void loadPaymentData();
}, { immediate: true });

onUnmounted(() => {
    invoiceStore.clearSelectedInvoice();
    invoiceStore.clearError();

    paymentStore.clearPaymentAccount();
    paymentStore.clearError();
});
</script>

<template>
    <section>

        <!-- Loading Invoice -->
        <div v-if="invoiceStore.loading">
            Loading invoice...
        </div>

        <!-- Invoice Error -->
        <div v-else-if="invoiceStore.error">
            {{ invoiceStore.error }}
        </div>

        <!-- Invoice Not Found -->
        <div v-else-if="!invoice">
            Invoice not found.
        </div>

        <div v-else-if="invoice.status !== 'unpaid'"
            role="status"
            class="rounded-xl border border-blue-200 bg-blue-50 p-5 text-blue-900">
            <h2 class="font-bold">
                {{ invoice.status === "pending_verification" ? "Payment Verification Pending" : invoice.status === "paid" ? "Payment Completed" : "Payment Unavailable" }}
            </h2>
            <p class="mt-1 text-[14px] leading-6">
                {{ invoicePaymentMessage }}
            </p>
        </div>

        <!-- Loading Payment Account -->
        <div v-else-if="paymentStore.paymentAccountLoading">
            Loading payment account...
        </div>

        <!-- Payment Account Not Found -->
        <div v-else-if="paymentStore.error">
            {{ paymentStore.error }}
        </div>

        <div v-else-if="!paymentAccount">
            Payment account is not available.
        </div>

        <!-- Payment Form -->
        <PaymentForm v-else :invoice="invoice" :payment-account="paymentAccount" :loading="paymentStore.submitting"
            @submit="handlePaymentSubmit" />

    </section>
</template>
