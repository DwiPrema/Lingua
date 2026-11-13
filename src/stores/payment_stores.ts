
import { defineStore } from "pinia";
import { ref } from "vue";

import type {
    Payment,
    SubmitPaymentPayload,
} from "@/types/payment_type";

import type {
    OrganizationBankAccount,
} from "@/types/organization_type";

import {
    fetchPaymentById,
    fetchMyPayments,
    fetchPaymentsByInvoiceId,
    fetchPaymentsByCourseId,
    fetchPaymentAccountByInvoiceId,
    submitPayment,
    verifyPayment,
    rejectPayment,
} from "@/service/payment_service";

// =====================================================
// Payment Store
// =====================================================

export const usePaymentStore = defineStore("payment", () => {

    // =================================================
    // State
    // =================================================

    // Collection of payments
    const payments = ref<Payment[]>([]);

    // Currently selected payment
    const selectedPayment = ref<Payment | null>(null);

    // Organization payment account
    const paymentAccount = ref<OrganizationBankAccount | null>(null);


    // =================================================
    // Loading States
    // =================================================

    const paymentsLoading = ref(false);
    const paymentLoading = ref(false);
    const paymentAccountLoading = ref(false);

    const submitting = ref(false);
    const verifying = ref(false);
    const rejecting = ref(false);


    // =================================================
    // Error State
    // =================================================

    const error = ref<string | null>(null);


    // =================================================
    // Helpers
    // =================================================

    function setError(err: unknown): void {
        error.value = err instanceof Error
            ? err.message
            : "An unexpected error occurred.";
    }

    function clearError(): void {
        error.value = null;
    }

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
    // Fetch Payment by ID
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
    // Fetch My Payments
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
    // Fetch Payments by Invoice ID
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
    // Fetch Payments by Course ID
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
    // Fetch Organization Payment Account
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
    // Submit Payment
    // =================================================

    async function createPayment(
        payload: SubmitPaymentPayload,
    ): Promise<string> {

        submitting.value = true;
        clearError();

        try {
            const result = await submitPayment(payload);

            return result;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            submitting.value = false;
        }
    }


    // =================================================
    // Verify Payment
    // =================================================

    async function approvePayment(
        paymentId: string,
    ): Promise<string> {

        verifying.value = true;
        clearError();

        try {
            const result = await verifyPayment(paymentId);

            return result;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            verifying.value = false;
        }
    }


    // =================================================
    // Reject Payment
    // =================================================

    async function declinePayment(
        paymentId: string,
        reason: string,
    ): Promise<string> {

        rejecting.value = true;
        clearError();

        try {
            const result = await rejectPayment(paymentId, reason);

            return result;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            rejecting.value = false;
        }
    }


    // =================================================
    // Return
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

        // Fetch Actions
        getPaymentById,
        getMyPayments,
        getPaymentsByInvoiceId,
        getPaymentsByCourseId,
        getPaymentAccountByInvoiceId,

        // Mutation Actions
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
