
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

    async function updateEnrollmentStatus(enrollmentId, status) {
        updatingStatus.value = true
        error.value = null

        try {
            const updatedEnrollment =
                await enrollmentService.updateEnrollmentsStatus(
                    enrollmentId,
                    status,
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


    return {
        enrollments,
        activeEnrollment,
        loading,
        submitting,
        updatingStatus,
        error,
        hasActiveEnrollment,
        fetchActiveEnrollment,
        addEnrollment,
        updateEnrollmentStatus,
        clearEnrollmentState,
        fetchEnrollmentById,
        fetchMyEnrollments,
    }
})
