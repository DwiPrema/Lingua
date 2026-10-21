
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import * as enrollmentService from '@/service/enrollments_service'

export const useEnrollmentStores = defineStore('enrollment', () => {
    const enrollments = ref([])
    const activeEnrollment = ref(null)

    const loading = ref(false)
    const submitting = ref(false)
    const updatingStatus = ref(false)
    const error = ref(null)

    const approvedStudents = ref([])
    const loadingApprovedStudents = ref(false)
    const approvedStudentsError = ref(null)

    const hasActiveEnrollment = computed(
        () => activeEnrollment.value !== null,
    )

    async function fetchActiveEnrollment(studentId, courseId) {
        loading.value = true
        error.value = null

        try {
            const data = await enrollmentService.getActiveEnrollment(
                studentId,
                courseId,
            )

            activeEnrollment.value = data?.[0] ?? null

            return activeEnrollment.value
        } catch (err) {
            error.value = err?.message ?? 'Failed to fetch enrollment.'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function addEnrollment(payload) {
        submitting.value = true
        error.value = null

        try {
            const enrollment = await enrollmentService.addEnrollments(payload)

            enrollments.value.unshift(enrollment)
            activeEnrollment.value = enrollment

            return enrollment
        } catch (err) {
            error.value = err?.message ?? 'Failed to create enrollment.'
            throw err
        } finally {
            submitting.value = false
        }
    }

    async function updateEnrollmentStatus(enrollmentId, status, rejectionReason) {
        updatingStatus.value = true
        error.value = null

        try {
            const updatedEnrollment =
                await enrollmentService.updateEnrollmentsStatus(
                    enrollmentId,
                    status,
                    rejectionReason
                )

            if (updatedEnrollment) {
                const index = enrollments.value.findIndex(
                    (item) => item.id === enrollmentId,
                )

                if (index !== -1) {
                    enrollments.value[index] = updatedEnrollment
                }

                if (activeEnrollment.value?.id === enrollmentId) {
                    activeEnrollment.value = updatedEnrollment
                }
            }

            return updatedEnrollment
        } catch (err) {
            error.value = err?.message ?? 'Failed to update enrollment.'
            throw err
        } finally {
            updatingStatus.value = false
        }
    }

    function clearEnrollmentState() {
        enrollments.value = []
        activeEnrollment.value = null
        error.value = null
    }


    async function fetchEnrollmentById(enrollmentId) {
        loading.value = true
        error.value = null

        try {
            const data =
                await enrollmentService.getEnrollmentById(enrollmentId)

            activeEnrollment.value = data
            return data
        } catch (err) {
            error.value = err?.message ?? 'Failed to fetch enrollment.'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function fetchMyEnrollments(studentId) {
        if (!studentId) {
            enrollments.value = []
            error.value = 'Please sign in to view your enrollments.'
            return
        }

        loading.value = true
        error.value = null

        try {
            enrollments.value =
                await enrollmentService.getMyEnrollments(studentId)
        } catch (err) {
            error.value = err?.message ?? 'Failed to fetch your enrollments.'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function deleteEnrollments(enrollmentId) {
        loading.value = true
        error.value = null

        try {
            await enrollmentService.deleteEnrollments(enrollmentId)

            enrollments.value = enrollments.value.filter(
                (enrollment) => String(enrollment.id) != String(enrollmentId)
            )
        } catch (err) {
            error.value = err.message ?? "Failed to cancel or delete enrollment"
        } finally {
            loading.value = false
        }
    }

    async function fetchApprovedStudentByCourseId(courseId) {
        loadingApprovedStudents.value = true
        approvedStudentsError.value = null

        try {
            const data =
                await enrollmentService.fetchApprovedStudentByCourseId(
                    courseId,
                )

            approvedStudents.value = data

            return data
        } catch (err) {
            approvedStudentsError.value =
                err?.message ?? 'Failed to load approved students.'

            throw err
        } finally {
            loadingApprovedStudents.value = false
        }
    }

    const pendingEnrollments = ref([])
    const loadingPendingEnrollments = ref(false)
    const processingEnrollmentId = ref(null)
    const enrollmentActionError = ref(null)

    async function fetchPendingEnrollmentsByCourseId(courseId) {
        loadingPendingEnrollments.value = true
        enrollmentActionError.value = null

        try {
            const data =
                await enrollmentService.fetchPendingEnrollmentsByCourseId(
                    courseId,
                )

            pendingEnrollments.value = data
            return data
        } catch (err) {
            enrollmentActionError.value =
                err?.message ?? 'Failed to fetch pending enrollments.'

            throw err
        } finally {
            loadingPendingEnrollments.value = false
        }
    }

    async function approveEnrollment(enrollmentId) {
        processingEnrollmentId.value = enrollmentId
        enrollmentActionError.value = null

        try {
            await enrollmentService.approveEnrollment(enrollmentId)

            pendingEnrollments.value = pendingEnrollments.value.filter(
                (item) => item.id !== enrollmentId,
            )

            return true
        } catch (err) {
            enrollmentActionError.value =
                err?.message ?? 'Failed to approve enrollment.'

            throw err
        } finally {
            processingEnrollmentId.value = null
        }
    }

    async function rejectEnrollment(enrollmentId, reason) {
        processingEnrollmentId.value = enrollmentId
        enrollmentActionError.value = null

        try {
            await enrollmentService.rejectEnrollment(enrollmentId, reason)

            pendingEnrollments.value = pendingEnrollments.value.filter(
                (item) => item.id !== enrollmentId,
            )

            return true
        } catch (err) {
            enrollmentActionError.value =
                err?.message ?? 'Failed to reject enrollment.'

            throw err
        } finally {
            processingEnrollmentId.value = null
        }
    }

    return {
        enrollments,
        activeEnrollment,
        loading,
        submitting,
        updatingStatus,
        error,
        hasActiveEnrollment,
        approvedStudents,
        loadingApprovedStudents,
        approvedStudentsError,
        pendingEnrollments,
        loadingPendingEnrollments,
        processingEnrollmentId,
        enrollmentActionError,

        fetchActiveEnrollment,
        addEnrollment,
        updateEnrollmentStatus,
        clearEnrollmentState,
        fetchEnrollmentById,
        fetchMyEnrollments,
        deleteEnrollments,
        fetchApprovedStudentByCourseId,
        fetchPendingEnrollmentsByCourseId,
        approveEnrollment,
        rejectEnrollment,
    }
})
