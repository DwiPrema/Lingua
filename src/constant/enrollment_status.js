export const StatusEnrollments = Object.freeze({
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    CANCELLED: 'cancelled',
})

export const StatusEnrollmentsExtension = {
    statusColor(enrollment) {
        switch (enrollment?.status?.toLowerCase()) {
            case 'approved':
                return 'success'

            case 'rejected':
                return 'red'

            case 'active':
                return 'primary'

            case 'pending':
            default:
                return 'orange'
        }
    },

    statusTitle(enrollment) {
        switch (enrollment?.status?.toLowerCase()) {
            case 'approved':
                return 'Enrollment Approved'

            case 'rejected':
                return 'Enrollment Rejected'

            case 'active':
                return 'Enrollment Active'

            case 'pending':
            default:
                return 'Waiting for Approval'
        }
    },

    statusDescription(enrollment) {
        switch (enrollment?.status?.toLowerCase()) {
            case 'approved':
                return 'Your enrollment has been approved by the course administrator.'

            case 'rejected':
                return 'Unfortunately, your enrollment was rejected by the course administrator.'

            case 'active':
                return 'You are now an active student in this course.'

            case 'pending':
            default:
                return 'Your enrollment has been submitted and is waiting for the course administrator to review.'
        }
    },
}