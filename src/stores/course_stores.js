import { defineStore } from "pinia";
import { ref } from "vue";
import * as courseDataService from "@/service/course_data_service";

export const useCourseStores = defineStore('courses', () => {
    const courses = ref([])
    const loading = ref(false)
    const error = ref(null)

    async function fetchAllCourseData() {
        loading.value = true
        error.value = null

        try {
            courses.value = await courseDataService.getAllCourseData()
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
            courses.value = await courseDataService.getCourseForLandingPreview()
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