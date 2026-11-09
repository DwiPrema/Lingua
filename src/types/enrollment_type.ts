import { StatusEnrollmentType } from "@/constant/enrollment_status";

export interface Enrollment {
    id: string;
    course_id: string;
    program_id: string;
    student_id: string;
    fullname: string;
    phone: string;
    status: string;
    
    address?: string | null;
    education_level?: string | null;
    school_name?: string | null;
    reviewed_by?: string | null;
    reviewed_at?: string | null;
    approved_at?: string | null;
    rejection_reason?: string | null;
    enrolled_at?: string | null;

    created_at: string;
    updated_at: string;
}

export interface CreateEnrollmentPayload {
  student_id: string;
  course_id: string;
  program_id: string;
  fullname: string;
  phone: string;
  education_level: string;
  school_name: string;
  address: string;
  status: StatusEnrollmentType;
}

export interface EnrollmentForm {
    fullname: string
    phone: string
    education_level: string
    school_name: string
    address: string
}