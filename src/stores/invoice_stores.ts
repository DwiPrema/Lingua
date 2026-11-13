
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

    // Collection of invoices
    const invoices = ref<Invoice[]>([]);

    // Currently selected invoice
    const selectedInvoice = ref<Invoice | null>(null);

    // Request state
    const loading = ref(false);
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

    function clearSelectedInvoice(): void {
        selectedInvoice.value = null;
    }

    function clearInvoices(): void {
        invoices.value = [];
    }


    // =================================================
    // Actions
    // =================================================

    /**
     * Fetch a single invoice by ID.
     * Used by invoice detail and payment pages.
     */
    async function getInvoiceById(
        invoiceId: string
    ): Promise<Invoice | null> {
        loading.value = true;
        clearError();

        // Prevent displaying stale invoice data
        clearSelectedInvoice();

        try {
            const result = await fetchInvoiceById(invoiceId);

            selectedInvoice.value = result;

            return result;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            loading.value = false;
        }
    }


    /**
     * Fetch invoices belonging to the authenticated student.
     */
    async function getMyInvoices(): Promise<Invoice[]> {
        loading.value = true;
        clearError();

        try {
            const result = await fetchMyInvoices();

            invoices.value = result;

            return result;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            loading.value = false;
        }
    }


    /**
     * Fetch invoices belonging to a specific course.
     */
    async function getInvoicesByCourseId(
        courseId: string
    ): Promise<Invoice[]> {
        loading.value = true;
        clearError();

        try {
            const result = await fetchInvoicesByCourseId(courseId);

            invoices.value = result;

            return result;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            loading.value = false;
        }
    }


    /**
     * Fetch an invoice by enrollment ID.
     */
    async function getInvoiceByEnrollmentId(
        enrollmentId: string
    ): Promise<Invoice | null> {
        loading.value = true;
        clearError();

        clearSelectedInvoice();

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
        // State
        invoices,
        selectedInvoice,
        loading,
        error,

        // Actions
        getInvoiceById,
        getMyInvoices,
        getInvoicesByCourseId,
        getInvoiceByEnrollmentId,

        // Helpers
        clearError,
        clearSelectedInvoice,
        clearInvoices,
    };
});
