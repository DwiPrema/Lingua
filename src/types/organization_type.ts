export interface Organization {
    id: string,
    owner_id: string,
    name: string,
    bank_name: string,
    account_number: string,
    account_name: string,
    qris_url: string | null,
    payment_notes: string | null,
    created_at: string,
}