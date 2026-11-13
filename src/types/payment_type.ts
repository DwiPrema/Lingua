export type PaymentMethod =
    | "bank_transfer"
    | "qris";

export type PaymentStatus =
    | "pending_verification"
    | "verified"
    | "rejected";

export interface Payment {
    id: string;
    invoice_id: string;
    payment_method: PaymentMethod;
    amount: number;
    proof_path: string;
    status: PaymentStatus;
    submitted_at: string;
    reviewed_by: string | null;
    reviewed_at: string | null;
    rejection_reason: string | null;
    created_at: string;
    updated_at: string;
}

export interface SubmitPaymentPayload {
    invoiceId: string;
    paymentMethod: PaymentMethod;
    amount: number;
    file: File;
}

export interface PaymentPayload {
    invoice_id: string;
    amount: number;
    payment_method: PaymentMethod;
    account_holder_name: string;
    payment_date: string;
    proof_file: File;
    notes: string | null;
}