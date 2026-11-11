export interface User {
    id: string
    email: string
    fullname: string
    nickname?: string | null
    phone?: string | null
    subscription_status?: string | null
    student_limit?: number | null
    created_at?: string
    updated_at?: string
    role?: string | null
    avatar_url: string | null
}

export interface UpdateUserPayload {
    fullname?: string
    nickname?: string
    phone?: string
    avatar_url?: string
}