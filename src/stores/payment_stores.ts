
import { defineStore } from "pinia";
import { ref } from "vue";

import type { Payment, PaymentPayload } from "@/types/payment_type";
import type { OrganizationBankAccount } from "@/types/organization_type";

import {
    fetchPaymentById,
    fetchMyPayments,
    fetchPaymentsByInvoiceId,
    fetchPaymentsByCourseId,
    fetchPaymentAccountByInvoiceId,
    createPaymentProofSignedUrl,
    submitPayment,
    verifyPayment,
    rejectPayment,
} from "@/service/payment_service";

// =====================================================
// PAYMENT STORE
// =====================================================

export const usePaymentStore = defineStore("payment", () => {

    // =================================================
    // STATE
    // =================================================

    const payments = ref<Payment[]>([]);
    const selectedPayment = ref<Payment | null>(null);

    const paymentAccount = ref<OrganizationBankAccount | null>(null);

    // =================================================
    // LOADING STATES
    // =================================================

    const paymentsLoading = ref(false);
    const paymentLoading = ref(false);
    const paymentAccountLoading = ref(false);

    const submitting = ref(false);
    const verifying = ref(false);
    const rejecting = ref(false);

    // =================================================
    // ERROR
    // =================================================

    const error = ref<string | null>(null);

    function setError(err: unknown): void {
        error.value = err instanceof Error
            ? err.message
            : "An unexpected error occurred.";
    }

    function clearError(): void {
        error.value = null;
    }

    // =================================================
    // CLEAR HELPERS
    // =================================================

    function clearPayments(): void {
        payments.value = [];
    }

    function clearSelectedPayment(): void {
        selectedPayment.value = null;
    }

    function clearPaymentAccount(): void {
        paymentAccount.value = null;
    }

    function clearPaymentData(): void {
        clearPayments();
        clearSelectedPayment();
        clearPaymentAccount();
        clearError();
    }

    // =================================================
    // FETCH PAYMENT BY ID
    // =================================================

    async function getPaymentById(
        paymentId: string,
    ): Promise<Payment | null> {
        paymentLoading.value = true;
        clearError();
        clearSelectedPayment();

        try {
            const result = await fetchPaymentById(paymentId);
            selectedPayment.value = result;
            return result;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            paymentLoading.value = false;
        }
    }

    // =================================================
    // FETCH MY PAYMENTS
    // =================================================

    async function getMyPayments(): Promise<Payment[]> {
        paymentsLoading.value = true;
        clearError();

        try {
            const result = await fetchMyPayments();
            payments.value = result;
            return result;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            paymentsLoading.value = false;
        }
    }

    // =================================================
    // FETCH PAYMENTS BY INVOICE
    // =================================================

    async function getPaymentsByInvoiceId(
        invoiceId: string,
    ): Promise<Payment[]> {
        paymentsLoading.value = true;
        clearError();

        try {
            const result = await fetchPaymentsByInvoiceId(invoiceId);
            payments.value = result;
            return result;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            paymentsLoading.value = false;
        }
    }

    // =================================================
    // FETCH PAYMENTS BY COURSE
    // =================================================

    async function getPaymentsByCourseId(
        courseId: string,
    ): Promise<Payment[]> {
        paymentsLoading.value = true;
        clearError();

        try {
            const result = await fetchPaymentsByCourseId(courseId);
            payments.value = result;
            return result;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            paymentsLoading.value = false;
        }
    }

    // =================================================
    // FETCH PAYMENT ACCOUNT
    // =================================================

    async function getPaymentAccountByInvoiceId(
        invoiceId: string,
    ): Promise<OrganizationBankAccount | null> {
        paymentAccountLoading.value = true;
        clearError();
        clearPaymentAccount();

        try {
            const result = await fetchPaymentAccountByInvoiceId(invoiceId);
            paymentAccount.value = result;
            return result;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            paymentAccountLoading.value = false;
        }
    }

    // =================================================
    // GET PAYMENT PROOF SIGNED URL
    // =================================================

    async function getPaymentProofUrl(
        proofPath: string,
    ): Promise<string> {
        try {
            return await createPaymentProofSignedUrl(proofPath);
        } catch (err) {
            setError(err);
            throw err;
        }
    }

    // =================================================
    // CREATE PAYMENT
    // =================================================

    async function createPayment(
        payload: PaymentPayload,
    ): Promise<string> {
        submitting.value = true;
        clearError();

        try {
            return await submitPayment(payload);
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            submitting.value = false;
        }
    }

    // =================================================
    // APPROVE PAYMENT
    // =================================================

    async function approvePayment(
        paymentId: string,
    ): Promise<string> {
        verifying.value = true;
        clearError();

        try {
            return await verifyPayment(paymentId);
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            verifying.value = false;
        }
    }

    // =================================================
    // DECLINE PAYMENT
    // =================================================

    async function declinePayment(
        paymentId: string,
        reason: string,
    ): Promise<string> {
        rejecting.value = true;
        clearError();

        try {
            return await rejectPayment(paymentId, reason);
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            rejecting.value = false;
        }
    }

    // =================================================
    // RETURN
    // =================================================

    return {
        // State
        payments,
        selectedPayment,
        paymentAccount,

        // Loading
        paymentsLoading,
        paymentLoading,
        paymentAccountLoading,
        submitting,
        verifying,
        rejecting,

        // Error
        error,

        // Fetch
        getPaymentById,
        getMyPayments,
        getPaymentsByInvoiceId,
        getPaymentsByCourseId,
        getPaymentAccountByInvoiceId,
        getPaymentProofUrl,

        // Mutations
        createPayment,
        approvePayment,
        declinePayment,

        // Helpers
        clearError,
        clearPayments,
        clearSelectedPayment,
        clearPaymentAccount,
        clearPaymentData,
    };
});
