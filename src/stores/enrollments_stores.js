
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import * as enrollmentService from '@/service/enrollments_service'

export const useEnrollmentStores = defineStore('enrollment', () => {
    // State
    const enrollments = ref([])
    const activeEnrollment = ref(null)

    const loading = ref(false)
    const submitting = ref(false)
    const updatingStatus = ref(false)
    const error = ref(null)

    // Getters
    const hasActiveEnrollment = computed(
        () => activeEnrollment.value !== null,
    )

    // Fetch an existing pending or approved enrollment
    async function fetchActiveEnrollment(studentId, courseId) {
        loading.value = true
        error.value = null

        try {
            const data = await enrollmentService.getActiveEnrollment(
                studentId,
                courseId,
            )

            // The service returns an array of matching records.
            activeEnrollment.value = data?.[0] ?? null

            return activeEnrollment.value
        } catch (err) {
            error.value = err?.message ?? 'Failed to fetch enrollment.'
            throw err
        } finally {
            loading.value = false
        }
    }

    // Create an enrollment
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

    // Update enrollment status
    async function updateEnrollmentStatus(enrollmentId, status) {
        updatingStatus.value = true
        error.value = null

        try {
            const updatedEnrollment =
                await enrollmentService.updateEnrollmentsStatus(
                    enrollmentId,
                    status,
                )

            // Update local state if the service returns the updated row.
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

    // Clear enrollment state when needed
    function clearEnrollmentState() {
        enrollments.value = []
        activeEnrollment.value = null
        error.value = null
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
    }
})
