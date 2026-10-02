import { defineStore } from "pinia";
import { ref } from "vue";
import { getAllCourseData, getCourseForLandingPreview } from "@/service/course_data_service";

export const useCourseStores = defineStore('courses', () => {
    const courses = ref([])
    const loading = ref(false)
    const error = ref(null)

    async function fetchAllCourseData() {
        loading.value = true
        error.value = null

        try {
            courses.value = await getAllCourseData()
        } catch (err) {
            error.value = err.message ?? "Failed to load data."
        } finally {
            loading.value = false
        }
    }

    async function fetchCourseDataForLandingPreview() {
        loading.value = true
        error.value = null

        try {
            courses.value = await getCourseForLandingPreview()
        } catch (err) {
            error.value = err.message ?? "Failed to load data."
        } finally {
            loading.value = false
        }
    }

    return {
        courses,
        loading,
        error,
        fetchAllCourseData,
        fetchCourseDataForLandingPreview,
    }
})