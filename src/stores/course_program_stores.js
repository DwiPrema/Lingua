import { courseProgramService } from '@/service/course_program_data_service'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCourseProgramStore = defineStore('course_program', () => {
    const coursePrograms = ref([])
    const loading = ref(false)
    const error = ref(null)

    async function addCourseProgram(payload) {
        loading.value = true
        error.value = null

        try {
            const courseProgram = await courseProgramService.addCourseProgram(payload)

            coursePrograms.value.push(courseProgram)

            return courseProgram
        } catch (err) {
            error.value = err.message ?? "Failed to create course program.";
            throw err;
        } finally {
            loading.value = false;
        }
    }

    async function updateCourseProgram(payload) {
        loading.value = true
        error.value = null

        try {
            const updatedCourseProgram = await courseProgramService.updateCourseProgram(payload);

            const index = coursePrograms.value.findIndex(
                (program) => String(program.id) === String(payload.programId)
            )

            if (index !== -1) {
                coursePrograms.value[index] = updatedCourseProgram;
            }

            return updatedCourseProgram;
        } catch (err) {
            error.value = err.message ?? "Failed to update course program.";
            throw err;
        } finally {
            loading.value = false;
        }
    }

    async function deleteCourseProgram(programId) {
        loading.value = true
        error.value = null

        try {
            await courseProgramService.deleteCourseProgram(programId)

            coursePrograms.value = coursePrograms.value.filter((program) => String(program.id) !== String(programId))
        } catch (err) {
            error.value = err.message ?? "Failed to delete course program.";
            throw err;
        } finally {
            loading.value = false;
        }
    }

    async function getAllCourseProgram(courseId) {
        loading.value = true
        error.value = null

        try {
            coursePrograms.value = await courseProgramService.getAllCourseProgram(courseId);

            return coursePrograms.value
        } catch (err) {
            error.value = err.message ?? "Failed to load data.";
            throw err;
        } finally {
            loading.value = false;
        }
    }

    return {
        //STATE
        coursePrograms,
        loading,
        error,

        //CRUD FUNCTION
        addCourseProgram,
        updateCourseProgram,
        deleteCourseProgram,
        getAllCourseProgram,
    }
})