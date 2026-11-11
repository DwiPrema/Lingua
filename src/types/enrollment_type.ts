
// =====================================================
// ENROLLMENT STATUS
// =====================================================

export type StatusEnrollmentType =
    | "pending"
    | "approved"
    | "rejected"
    | "active";

export const StatusEnrollments = Object.freeze({
    PENDING: "pending",
    APPROVED: "approved",
    REJECTED: "rejected",
    ACTIVE: "active",
} as const);

// =====================================================
// ENROLLMENT INTERFACE
// =====================================================

export interface Enrollment {
    id: string;
    course_id: string;
    program_id: string;
    student_id: string;

    fullname: string;
    phone: string;

    status: StatusEnrollmentType;

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

// =====================================================
// CREATE ENROLLMENT PAYLOAD
// =====================================================

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

// =====================================================
// ENROLLMENT FORM
// =====================================================

export interface EnrollmentForm {
    fullname: string;
    phone: string;
    education_level: string;
    school_name: string;
    address: string;
}

// =====================================================
// ENROLLMENT STATUS EXTENSION
// =====================================================

export const StatusEnrollmentsExtension = {
    statusColor(enrollment: Enrollment): string {
        switch (enrollment.status) {
            case StatusEnrollments.APPROVED:
                return "success";

            case StatusEnrollments.REJECTED:
                return "red";

            case StatusEnrollments.ACTIVE:
                return "primary";

            case StatusEnrollments.PENDING:
            default:
                return "orange";
        }
    },

    statusTitle(enrollment: Enrollment): string {
        switch (enrollment.status) {
            case StatusEnrollments.APPROVED:
                return "Enrollment Approved";

            case StatusEnrollments.REJECTED:
                return "Enrollment Rejected";

            case StatusEnrollments.ACTIVE:
                return "Enrollment Active";

            case StatusEnrollments.PENDING:
            default:
                return "Waiting for Approval";
        }
    },

    statusDescription(enrollment: Enrollment): string {
        switch (enrollment.status) {
            case StatusEnrollments.APPROVED:
                return "Your enrollment has been approved by the course administrator.";

            case StatusEnrollments.REJECTED:
                return "Unfortunately, your enrollment was rejected by the course administrator.";

            case StatusEnrollments.ACTIVE:
                return "You are now an active student in this course.";

            case StatusEnrollments.PENDING:
            default:
                return "Your enrollment has been submitted and is waiting for the course administrator to review.";
        }
    },
};
