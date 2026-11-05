export type InvoiceStatus =
    | 'unpaid'
    | 'pending_verification'
    | 'paid'
    | 'cancelled'

export type InvoiceType =
    | "initial"
    | "monthly"

export interface Invoice {
    id: string
    invoice_number: string
    enrollment_id: string
    invoice_type: InvoiceType
    registration_fee: number
    monthly_fee: number
    total_amount: number
    status: InvoiceStatus
    due_at: string | null
    created_at: string
    updated_at: string
}