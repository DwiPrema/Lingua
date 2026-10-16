import { defineStore } from "pinia";
import { ref } from "vue";
import * as courseDataService from "@/service/course_data_service";

export const useCourseStores = defineStore("courses", () => {
    const courses = ref([]);
    const loading = ref(false);
    const error = ref(null);

    async function fetchAllCourseData() {
        loading.value = true;
        error.value = null;

        try {
            courses.value = await courseDataService.getAllCourseData();
            return courses.value;
        } catch (err) {
            error.value = err.message ?? "Failed to load data.";
            throw err;
        } finally {
            loading.value = false;
        }
    }

    async function fetchCourseDataForLandingPreview() {
        loading.value = true;
        error.value = null;

        try {
            courses.value = await courseDataService.getCourseForLandingPreview();
            return courses.value;
        } catch (err) {
            error.value = err.message ?? "Failed to load data.";
            throw err;
        } finally {
            loading.value = false;
        }
    }

    async function fetchMyCourses() {
        loading.value = true;
        error.value = null;

        try {
            courses.value = await courseDataService.fetchMyCourses();
            return courses.value;
        } catch (err) {
            error.value = err.message ?? "Failed to load courses.";
            throw err;
        } finally {
            loading.value = false;
        }
    }

    async function fetchMyCourseById(courseId) {
        loading.value = true;
        error.value = null;

        try {
            const myCourses = await courseDataService.fetchMyCourses();
            courses.value = myCourses;

            const course = myCourses.find(
                (item) => String(item.id) === String(courseId),
            );

            if (!course) {
                throw new Error(
                    "Course was not found or you do not have permission to edit it.",
                );
            }

            return course;
        } catch (err) {
            error.value = err.message ?? "Failed to load course.";
            throw err;
        } finally {
            loading.value = false;
        }
    }

    async function fetchCourseById(courseId) {
        loading.value = true;
        error.value = null;

        try {
            const course = await courseDataService.fetchCourseById(courseId);

            return course;
        } catch (err) {
            error.value = err.message ?? "Failed to load course.";
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
            error.value = err.message ?? "Failed to create course.";
            throw err;
        } finally {
            loading.value = false;
        }
    }

    async function updateCourse(payload) {
        loading.value = true;
        error.value = null;

        try {
            const updatedCourse =
                await courseDataService.updateCourse(payload);

            const index = courses.value.findIndex(
                (course) =>
                    String(course.id) === String(payload.courseId),
            );

            if (index !== -1) {
                courses.value[index] = updatedCourse;
            }

            return updatedCourse;
        } catch (err) {
            error.value = err.message ?? "Failed to update course.";
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
                (course) => String(course.id) !== String(courseId),
            );
        } catch (err) {
            error.value = err.message ?? "Failed to delete course.";
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
        fetchMyCourseById,
        fetchCourseById,

        addCourse,
        updateCourse,
        deleteCourse,
    };
});
