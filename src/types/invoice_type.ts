export type InvoiceType = "initial" | "monthly";

export type InvoiceStatus =
    | "unpaid"
    | "pending_verification"
    | "paid"
    | "cancelled";

// =====================================================
// MAIN INVOICE INTERFACE
// =====================================================

export interface Invoice {
    // Primary identification
    id: string;
    invoice_number: string;
    enrollment_id: string;

    // Invoice classification
    invoice_type: InvoiceType;
    status: InvoiceStatus;

    // Payment breakdown
    registration_fee: number;
    monthly_fee: number;
    total_amount: number;

    // Billing period
    billing_period_start: string | null;
    billing_period_end: string | null;

    // Payment deadline
    due_at: string | null;

    // Timestamps
    created_at: string;
    updated_at: string;
}

// =====================================================
// PAYLOAD TYPES
// =====================================================

export interface CreateInvoicePayload {
    enrollment_id: string;
    invoice_type: InvoiceType;
    registration_fee: number;
    monthly_fee: number;
    total_amount: number;
    billing_period_start?: string | null;
    billing_period_end?: string | null;
    due_at?: string | null;
}

export interface UpdateInvoicePayload {
    due_at?: string | null;
}
