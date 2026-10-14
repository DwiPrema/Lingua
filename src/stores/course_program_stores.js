import { defineStore } from "pinia";
import { ref } from "vue";

import { courseProgramService } from "@/service/course_program_data_service";

export const useCourseProgramStore = defineStore(
    "course_program",
    () => {
        // STATE
        const coursePrograms = ref([]);
        const loading = ref(false);
        const error = ref(null);

        // CREATE
        async function addCourseProgram(payload) {
            loading.value = true;
            error.value = null;

            try {
                const courseProgram =
                    await courseProgramService.addCourseProgram(payload);

                coursePrograms.value.push(courseProgram);

                return courseProgram;
            } catch (err) {
                error.value =
                    err.message ?? "Failed to create course program.";

                throw err;
            } finally {
                loading.value = false;
            }
        }

        // UPDATE
        async function updateCourseProgram(payload) {
            loading.value = true;
            error.value = null;

            try {
                const updatedCourseProgram =
                    await courseProgramService.updateCourseProgram(payload);

                const index = coursePrograms.value.findIndex(
                    (program) =>
                        String(program.id) === String(payload.programId),
                );

                if (index !== -1) {
                    coursePrograms.value[index] = updatedCourseProgram;
                }

                return updatedCourseProgram;
            } catch (err) {
                error.value =
                    err.message ?? "Failed to update course program.";

                throw err;
            } finally {
                loading.value = false;
            }
        }

        // DELETE
        async function deleteCourseProgram(programId) {
            loading.value = true;
            error.value = null;

            try {
                await courseProgramService.deleteCourseProgram(programId);

                coursePrograms.value = coursePrograms.value.filter(
                    (program) => String(program.id) !== String(programId),
                );
            } catch (err) {
                error.value =
                    err.message ?? "Failed to delete course program.";

                throw err;
            } finally {
                loading.value = false;
            }
        }

        // READ: GET ALL PROGRAMS FOR A COURSE
        async function getAllCourseProgram(courseId) {
            loading.value = true;
            error.value = null;

            try {
                coursePrograms.value =
                    await courseProgramService.getAllCourseProgram(courseId);

                return coursePrograms.value;
            } catch (err) {
                error.value = err.message ?? "Failed to load course programs.";

                throw err;
            } finally {
                loading.value = false;
            }
        }

        // READ: GET ONE PROGRAM BY COURSE ID AND PROGRAM ID
        async function getCourseProgramById(courseId, programId) {
            if (!courseId || !programId) {
                throw new Error("Course ID and program ID are required.");
            }

            const programs = await getAllCourseProgram(courseId);

            const program = programs.find(
                (item) => String(item.id) === String(programId),
            );

            if (!program) {
                throw new Error(
                    "Course program was not found in the selected course.",
                );
            }

            return program;
        }

        return {
            // STATE
            coursePrograms,
            loading,
            error,

            // CRUD ACTIONS
            addCourseProgram,
            updateCourseProgram,
            deleteCourseProgram,
            getAllCourseProgram,
            getCourseProgramById,
        };
    },
);