export type StatusEnrollmentType = 'pending' | 'approved' | 'rejected' | 'active';

export const StatusEnrollments = Object.freeze({
    PENDING: 'pending' as const,
    APPROVED: 'approved' as const,
    REJECTED: 'rejected' as const,
    ACTIVE: 'active' as const,
});

export interface Enrollment {
    status?: StatusEnrollmentType | string;
    [key: string]: any; 
}

export const StatusEnrollmentsExtension = {
    statusColor(enrollment: Enrollment): string {
        switch (enrollment?.status?.toLowerCase()) {
            case 'approved':
                return 'success';

            case 'rejected':
                return 'red';

            case 'active':
                return 'primary';

            case 'pending':
            default:
                return 'orange';
        }
    },

    statusTitle(enrollment: Enrollment): string {
        switch (enrollment?.status?.toLowerCase()) {
            case 'approved':
                return 'Enrollment Approved';

            case 'rejected':
                return 'Enrollment Rejected';

            case 'active':
                return 'Enrollment Active';

            case 'pending':
            default:
                return 'Waiting for Approval';
        }
    },

    statusDescription(enrollment: Enrollment): string {
        switch (enrollment?.status?.toLowerCase()) {
            case 'approved':
                return 'Your enrollment has been approved by the course administrator.';

            case 'rejected':
                return 'Unfortunately, your enrollment was rejected by the course administrator.';

            case 'active':
                return 'You are now an active student in this course.';

            case 'pending':
            default:
                return 'Your enrollment has been submitted and is waiting for the course administrator to review.';
        }
    },
};