export interface Course {
    id: string,
    name: string,
    description: string | null,
    address: string,
    owner_id: string,
    organization_id: string,
    created_at: string,
    updated_at: string,
}

export interface UpdateCourseInput {
    id: string;
    name?: string;
    description?: string;
    address?: string;
}

export interface CreateCourseInput {
    name: string;
    description: string;
    address: string;
    organization_id: string;
}