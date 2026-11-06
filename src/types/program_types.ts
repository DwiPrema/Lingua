export interface Programs {
    id: string,
    course_id: string,
    name: string,
    description: string | null,
    monthly_fee: number,
    registration_fee: number,
    created_at: string,
    updated_at: string,
}

export interface CreateProgramInput {
    course_id: string,
    name: string,
    description?: string | null,
    registration_fee: number | null,
    monthly_fee: number | null,
}

export interface UpdateProgramInput {
    id: string,
    name: string,
    description?: string | null,
    registration_fee: number | null,
    monthly_fee: number | null,
}