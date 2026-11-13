<script setup lang="ts">
import { computed, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";

import { useInvoiceStore } from "@/stores/invoice_stores";
import { usePaymentStore } from "@/stores/payment_stores";

import PaymentForm from "@/views/payment/PaymentForm.vue";

const route = useRoute();

const invoiceStore = useInvoiceStore();
const paymentStore = usePaymentStore();

// =====================================================
// State
// =====================================================

const invoiceId = computed(() => {
    return route.params.invoiceId as string;
});

const invoice = computed(() => {
    return invoiceStore.selectedInvoice;
});

const paymentAccount = computed(() => {
    return paymentStore.paymentAccount;
});

// =====================================================
// Fetch Data
// =====================================================

async function loadPaymentData(): Promise<void> {
    if (!invoiceId.value) return;

    try {
        // Fetch invoice
        await invoiceStore.getInvoiceById(invoiceId.value);

        // Fetch organization payment account
        await paymentStore.getPaymentAccountByInvoiceId(
            invoiceId.value
        );

    } catch (err) {
        console.error("Failed to load payment data:", err);
    }
}

// =====================================================
// Lifecycle
// =====================================================

onMounted(() => {
    loadPaymentData();
});

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
        <PaymentForm v-else :invoice="invoice" :payment-account="paymentAccount" :loading="paymentStore.submitting" />

    </section>
</template>
