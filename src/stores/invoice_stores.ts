
import { defineStore } from "pinia";
import { ref } from "vue";

import type { Invoice } from "@/types/invoice_type";

import {
    fetchInvoiceById,
    fetchMyInvoices,
    fetchInvoicesByCourseId,
    fetchInvoiceByEnrollmentId,
} from "@/service/invoice_service";

// =====================================================
// Invoice Store
// =====================================================

export const useInvoiceStore = defineStore("invoice", () => {

    // =================================================
    // State
    // =================================================

    const invoices = ref<Invoice[]>([]);
    const selectedInvoice = ref<Invoice | null>(null);

    const loading = ref(false);
    const error = ref<string | null>(null);

    // =================================================
    // Helpers
    // =================================================

    function setError(err: unknown) {
        error.value = err instanceof Error
            ? err.message
            : "An unexpected error occurred.";
    }

    function clearError() {
        error.value = null;
    }

    // =================================================
    // Actions
    // =================================================

    async function getInvoiceById(invoiceId: string) {
        loading.value = true;
        clearError();

        try {
            selectedInvoice.value = await fetchInvoiceById(invoiceId);
            return selectedInvoice.value;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            loading.value = false;
        }
    }

    async function getMyInvoices() {
        loading.value = true;
        clearError();

        try {
            invoices.value = await fetchMyInvoices();
            return invoices.value;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            loading.value = false;
        }
    }

    async function getInvoicesByCourseId(courseId: string) {
        loading.value = true;
        clearError();

        try {
            invoices.value = await fetchInvoicesByCourseId(courseId);
            return invoices.value;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            loading.value = false;
        }
    }


    async function getInvoiceByEnrollmentId(enrollmentId: string) {
        loading.value = true;
        clearError();

        try {
            const result = await fetchInvoiceByEnrollmentId(enrollmentId);

            selectedInvoice.value = result;

            return result;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            loading.value = false;
        }
    }


    // =================================================
    // Return
    // =================================================

    return {
        invoices,
        selectedInvoice,
        loading,
        error,

        getInvoiceById,
        getMyInvoices,
        getInvoicesByCourseId,
        getInvoiceByEnrollmentId,

        clearError,
    };
});
