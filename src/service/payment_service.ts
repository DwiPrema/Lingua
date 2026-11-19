
import { DatabaseTableName } from "@/constant/database_table_name";
import { supabase } from "@/lib/supabase";

import type { OrganizationBankAccount } from "@/types/organization_type";
import type {
    Payment,
    PaymentPayload,
} from "@/types/payment_type";

// =====================================================
// CONSTANTS
// =====================================================

const PAYMENT_PROOF_BUCKET = "payment-proofs";

const ALLOWED_FILE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024;

// =====================================================
// UPLOAD PAYMENT PROOF
// =====================================================

async function uploadPaymentProof(
    userId: string,
    paymentId: string,
    file: File,
): Promise<string> {
    if (!file) {
        throw new Error("Payment proof file is required.");
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        throw new Error("Unsupported payment proof file type.");
    }

    if (file.size === 0) {
        throw new Error("Payment proof file is empty.");
    }

    if (file.size > MAX_FILE_SIZE) {
        throw new Error("Payment proof must not exceed 5 MB.");
    }

    const extension = file.name.split(".").pop()?.toLowerCase();

    if (!extension) {
        throw new Error("Invalid payment proof filename.");
    }

    const proofPath = `${userId}/${paymentId}/proof.${extension}`;

    const { error } = await supabase.storage
        .from(PAYMENT_PROOF_BUCKET)
        .upload(proofPath, file, {
            contentType: file.type,
            upsert: false,
        });

    if (error) {
        throw error;
    }

    return proofPath;
}

// =====================================================
// CREATE SIGNED URL
// =====================================================

export async function createPaymentProofSignedUrl(
    proofPath: string,
): Promise<string> {
    if (!proofPath?.trim()) {
        throw new Error("Payment proof path is required.");
    }

    const { data, error } = await supabase.storage
        .from(PAYMENT_PROOF_BUCKET)
        .createSignedUrl(proofPath, 300);

    if (error) {
        throw error;
    }

    if (!data?.signedUrl) {
        throw new Error("Failed to generate payment proof URL.");
    }

    return data.signedUrl;
}

// =====================================================
// SUBMIT PAYMENT
// =====================================================

export async function submitPayment(
    payload: PaymentPayload,
): Promise<string> {
    const {
        invoice_id,
        payment_method,
        amount,
        proof_file,
    } = payload;

    if (!invoice_id) {
        throw new Error("Invoice ID is required.");
    }

    if (!amount || amount <= 0) {
        throw new Error("Payment amount must be greater than zero.");
    }

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError) throw authError;

    if (!user) {
        throw new Error("User is not authenticated.");
    }

    const paymentId = crypto.randomUUID();

    const proofPath = await uploadPaymentProof(
        user.id,
        paymentId,
        proof_file,
    );

    try {
        const { data, error } = await supabase.rpc("submit_payment", {
            p_payment_id: paymentId,
            p_invoice_id: invoice_id,
            p_payment_method: payment_method,
            p_amount: amount,
            p_proof_path: proofPath,
        });

        if (error) throw error;

        return data as string;
    } catch (err) {
        // Remove uploaded proof if RPC submission fails.
        const { error: cleanupError } = await supabase.storage
            .from(PAYMENT_PROOF_BUCKET)
            .remove([proofPath]);

        if (cleanupError) {
            console.error(
                "Failed to cleanup payment proof:",
                cleanupError,
            );
        }

        throw err;
    }
}

// =====================================================
// FETCH PAYMENT BY ID
// =====================================================

export async function fetchPaymentById(
    paymentId: string,
): Promise<Payment | null> {
    if (!paymentId) {
        throw new Error("Payment ID is required.");
    }

    const { data, error } = await supabase
        .from(DatabaseTableName.paymentsCollection)
        .select()
        .eq("id", paymentId)
        .maybeSingle();

    if (error) throw error;

    return data as Payment | null;
}

// =====================================================
// FETCH MY PAYMENTS
// =====================================================

export async function fetchMyPayments(): Promise<Payment[]> {
    const { data, error } = await supabase
        .from(DatabaseTableName.paymentsCollection)
        .select()
        .order("created_at", { ascending: false });

    if (error) throw error;

    return (data ?? []) as Payment[];
}

// =====================================================
// FETCH PAYMENTS BY INVOICE ID
// =====================================================

export async function fetchPaymentsByInvoiceId(
    invoiceId: string,
): Promise<Payment[]> {
    if (!invoiceId) {
        throw new Error("Invoice ID is required.");
    }

    const { data, error } = await supabase
        .from(DatabaseTableName.paymentsCollection)
        .select()
        .eq("invoice_id", invoiceId)
        .order("created_at", { ascending: false });

    if (error) throw error;

    return (data ?? []) as Payment[];
}

// =====================================================
// FETCH PAYMENTS BY COURSE ID
// =====================================================

export async function fetchPaymentsByCourseId(
    courseId: string,
): Promise<Payment[]> {
    if (!courseId) {
        throw new Error("Course ID is required.");
    }

    const { data: enrollments, error: enrollmentError } =
        await supabase
            .from(DatabaseTableName.enrollmentsCollection)
            .select("id")
            .eq("course_id", courseId);

    if (enrollmentError) throw enrollmentError;

    if (!enrollments?.length) return [];

    const enrollmentIds = enrollments.map(
        (enrollment) => enrollment.id,
    );

    const { data: invoices, error: invoiceError } =
        await supabase
            .from(DatabaseTableName.invoicesCollection)
            .select("id")
            .in("enrollment_id", enrollmentIds);

    if (invoiceError) throw invoiceError;

    if (!invoices?.length) return [];

    const invoiceIds = invoices.map(
        (invoice) => invoice.id,
    );

    const { data, error } = await supabase
        .from(DatabaseTableName.paymentsCollection)
        .select()
        .in("invoice_id", invoiceIds)
        .order("created_at", { ascending: false });

    if (error) throw error;

    return (data ?? []) as Payment[];
}

// =====================================================
// VERIFY PAYMENT
// =====================================================

export async function verifyPayment(
    paymentId: string,
): Promise<string> {
    if (!paymentId) {
        throw new Error("Payment ID is required.");
    }

    const { data, error } = await supabase.rpc("verify_payment", {
        p_payment_id: paymentId,
    });

    if (error) throw error;

    return data as string;
}

// =====================================================
// REJECT PAYMENT
// =====================================================

export async function rejectPayment(
    paymentId: string,
    reason: string,
): Promise<string> {
    if (!paymentId) {
        throw new Error("Payment ID is required.");
    }

    if (!reason.trim()) {
        throw new Error("Rejection reason is required.");
    }

    const { data, error } = await supabase.rpc("reject_payment", {
        p_payment_id: paymentId,
        p_reason: reason.trim(),
    });

    if (error) throw error;

    return data as string;
}

// =====================================================
// FETCH ORGANIZATION PAYMENT ACCOUNT
// =====================================================

export async function fetchPaymentAccountByInvoiceId(
    invoiceId: string,
): Promise<OrganizationBankAccount | null> {
    if (!invoiceId) {
        throw new Error("Invoice ID is required.");
    }

    const { data, error } = await supabase
        .rpc("get_payment_account_by_invoice_id", {
            p_invoice_id: invoiceId,
        })
        .maybeSingle();

    if (error) {
        console.error("Failed to fetch payment account:", error);
        throw error;
    }

    if (!data) return null;

    return data as OrganizationBankAccount;
}
