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

    async function fetchMyCourses() {
        loading.value = true;
        error.value = null;

        try {
            courses.value = await courseDataService.fetchMyCourses();
            return courses.value;
        } catch (err) {
            error.value = err.message;
            throw err;
        } finally {
            loading.value = false;
        }
    }

    async function addCourse(payload) {
        loading.value = true;
        error.value = null;

        try {
            const course = await courseDataService.addCourse(payload);
            courses.value.push(course);

            return course;
        } catch (err) {
            error.value = err.message;
            throw err;
        } finally {
            loading.value = false;
        }
    }

    async function updateCourse(payload) {
        loading.value = true;
        error.value = null;

        try {
            const updatedCourse = await courseDataService.updateCourse(payload);

            const index = courses.value.findIndex(
                (course) => course.id === payload.courseId
            );

            if (index !== -1) {
                courses.value[index] = updatedCourse;
            }

            return updatedCourse;
        } catch (err) {
            error.value = err.message;
            throw err;
        } finally {
            loading.value = false;
        }
    }

    async function deleteCourse(courseId) {
        loading.value = true;
        error.value = null;

        try {
            await courseDataService.deleteCourse(courseId);

            courses.value = courses.value.filter(
                (course) => course.id !== courseId
            );
        } catch (err) {
            error.value = err.message;
            throw err;
        } finally {
            loading.value = false;
        }
    }

    return {
        courses,
        loading,
        error,
        fetchAllCourseData,
        fetchCourseDataForLandingPreview,
        fetchMyCourses,

        addCourse,
        updateCourse,
        deleteCourse,
    }
})