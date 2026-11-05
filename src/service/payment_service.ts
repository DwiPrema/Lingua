
import { DatabaseTableName } from "@/constant/database_table_name";
import { supabase } from "@/lib/supabase";

import type {
    Payment,
    SubmitPaymentPayload,
} from "@/types/payment_types";

// =====================================================
// Constants
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
// Upload payment proof
// =====================================================

async function uploadPaymentProof(
    userId: string,
    paymentId: string,
    file: File,
): Promise<string> {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        throw new Error("Unsupported payment proof file type.");
    }

    if (file.size > MAX_FILE_SIZE) {
        throw new Error("Payment proof must not exceed 5 MB.");
    }

    if (file.size === 0) {
        throw new Error("Payment proof file is empty.");
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
// Submit payment
// =====================================================

export async function submitPayment(
    payload: SubmitPaymentPayload,
): Promise<string> {
    const {
        invoiceId,
        paymentMethod,
        amount,
        file,
    } = payload;

    if (!invoiceId) {
        throw new Error("Invoice ID is required.");
    }

    if (!amount || amount <= 0) {
        throw new Error("Payment amount must be greater than zero.");
    }

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
        throw authError;
    }

    if (!user) {
        throw new Error("User is not authenticated.");
    }

    // Generate payment ID before uploading the proof.
    const paymentId = crypto.randomUUID();

    // Upload proof to private Storage.
    const proofPath = await uploadPaymentProof(
        user.id,
        paymentId,
        file,
    );

    // Submit payment through RPC.
    const { data, error } = await supabase.rpc("submit_payment", {
        p_payment_id: paymentId,
        p_invoice_id: invoiceId,
        p_payment_method: paymentMethod,
        p_amount: amount,
        p_proof_path: proofPath,
    });

    if (error) {
        // The uploaded file may remain in Storage.
        // Cleanup will be handled separately.
        throw error;
    }

    return data as string;
}

// =====================================================
// Fetch payment by ID
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

    if (error) {
        throw error;
    }

    return data as Payment | null;
}

// =====================================================
// Fetch payments belonging to current student
// =====================================================

export async function fetchMyPayments(): Promise<Payment[]> {
    const { data, error } = await supabase
        .from(DatabaseTableName.paymentsCollection)
        .select()
        .order("created_at", { ascending: false });

    if (error) {
        throw error;
    }

    // RLS ensures students only receive their own payments.
    return (data ?? []) as Payment[];
}

// =====================================================
// Fetch payments by invoice ID
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

    if (error) {
        throw error;
    }

    return (data ?? []) as Payment[];
}

// =====================================================
// Fetch payments belonging to a course
// =====================================================

export async function fetchPaymentsByCourseId(
    courseId: string,
): Promise<Payment[]> {
    if (!courseId) {
        throw new Error("Course ID is required.");
    }

    // Get enrollment IDs.
    const { data: enrollments, error: enrollmentError } =
        await supabase
            .from(DatabaseTableName.enrollmentsCollection)
            .select("id")
            .eq("course_id", courseId);

    if (enrollmentError) {
        throw enrollmentError;
    }

    if (!enrollments || enrollments.length === 0) {
        return [];
    }

    const enrollmentIds = enrollments.map(
        (enrollment) => enrollment.id,
    );

    // Get invoice IDs.
    const { data: invoices, error: invoiceError } =
        await supabase
            .from(DatabaseTableName.invoicesCollection)
            .select("id")
            .in("enrollment_id", enrollmentIds);

    if (invoiceError) {
        throw invoiceError;
    }

    if (!invoices || invoices.length === 0) {
        return [];
    }

    const invoiceIds = invoices.map(
        (invoice) => invoice.id,
    );

    // Get payments.
    const { data, error } = await supabase
        .from(DatabaseTableName.paymentsCollection)
        .select()
        .in("invoice_id", invoiceIds)
        .order("created_at", { ascending: false });

    if (error) {
        throw error;
    }

    return (data ?? []) as Payment[];
}

// =====================================================
// Verify payment
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

    if (error) {
        throw error;
    }

    return data as string;
}

// =====================================================
// Reject payment
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

    if (error) {
        throw error;
    }

    return data as string;
}
