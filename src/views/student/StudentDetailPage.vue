<script setup lang="ts">
import { computed, watch } from "vue";
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { StatusEnrollmentsExtension } from "@/types/enrollment_type";
import { useEnrollmentStores } from "@/stores/enrollments_stores";
import { useUserDataStores } from "@/stores/user_data_stores";

// =====================================================
// ROUTER & STORE
// =====================================================

const route = useRoute();
const enrollmentStore = useEnrollmentStores();
const userStore = useUserDataStores()

const {
    activeEnrollment,
    loading,
    error,
} = storeToRefs(enrollmentStore);

const enrollment = activeEnrollment;

// =====================================================
// FETCH ENROLLMENT
// =====================================================

async function loadEnrollment(): Promise<void> {
    const enrollmentId = route.params.enrollmentId;

    if (typeof enrollmentId !== "string" || !enrollmentId) {
        return;
    }

    try {
        await enrollmentStore.fetchEnrollmentById(enrollmentId);
    } catch (err) {
        console.error("Failed to load enrollment:", err);
    }
}

watch(
    () => route.params.enrollmentId,
    () => {
        loadEnrollment();
    },
    { immediate: true }
);

// =====================================================
// ENROLLMENT STATUS
// =====================================================

const enrollmentStatus = computed(() => {
    if (!enrollment.value) return "";

    return StatusEnrollmentsExtension.statusTitle(
        enrollment.value
    );
});

const statusDescription = computed(() => {
    if (!enrollment.value) return "";

    return StatusEnrollmentsExtension.statusDescription(
        enrollment.value
    );
});

const statusClass = computed(() => {
    switch (enrollment.value?.status) {
        case "active":
            return "bg-green-100 text-green-700";

        case "approved":
            return "bg-blue-100 text-blue-700";

        case "rejected":
            return "bg-red-100 text-red-700";

        case "pending":
        default:
            return "bg-orange-100 text-orange-700";
    }
});

function getStudentAvatarUrl(studentId: string): string | null {
    return userStore.userDataById[studentId]?.avatar_url ?? null;
}

// =====================================================
// DATE FORMATTER
// =====================================================

function formatDate(date?: string | null): string {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "Not available";
    }

    return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).format(parsedDate);
}

const registrationDate = computed(() =>
    formatDate(enrollment.value?.created_at)
);

const reviewedDate = computed(() =>
    formatDate(enrollment.value?.reviewed_at)
);

const approvedDate = computed(() =>
    formatDate(enrollment.value?.approved_at)
);

const enrolledDate = computed(() =>
    formatDate(enrollment.value?.enrolled_at)
);

const updatedDate = computed(() =>
    formatDate(enrollment.value?.updated_at)
);
</script>


<template>
    <main class="space-y-6">

        <!-- ================================================= -->
        <!-- LOADING -->
        <!-- ================================================= -->

        <div v-if="loading" class="py-16 text-center">
            <p class="text-gray-500">
                Loading student details...
            </p>
        </div>

        <!-- ================================================= -->
        <!-- ERROR -->
        <!-- ================================================= -->

        <div v-else-if="error" class="rounded-xl border border-red-200 bg-red-50 p-6">
            <h2 class="font-semibold text-red-700">
                Failed to Load Student
            </h2>

            <p class="mt-2 text-sm text-red-600">
                {{ error }}
            </p>

            <button @click="loadEnrollment" class="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm text-white">
                Try Again
            </button>
        </div>

        <!-- ================================================= -->
        <!-- EMPTY -->
        <!-- ================================================= -->

        <div v-else-if="!enrollment" class="py-16 text-center">
            <p class="text-gray-500">
                Enrollment not found.
            </p>
        </div>

        <!-- ================================================= -->
        <!-- STUDENT DETAIL -->
        <!-- ================================================= -->

        <template v-else>

            <!-- ================================================= -->
            <!-- PAGE HEADER -->
            <!-- ================================================= -->

            <section class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p class="text-sm text-gray-500">
                        Manage Students / Student Detail
                    </p>

                    <h1 class="mt-1 text-2xl font-bold text-gray-900">
                        Student Detail
                    </h1>

                    <p class="mt-1 text-sm text-gray-500">
                        View student information and enrollment details.
                    </p>
                </div>

                <span class="inline-flex w-fit items-center rounded-full px-4 py-2 text-sm font-semibold"
                    :class="statusClass">
                    {{ enrollmentStatus }}
                </span>
            </section>

            <!-- ================================================= -->
            <!-- STUDENT PROFILE -->
            <!-- ================================================= -->

            <section class="overflow-hidden rounded-2xl border border-gray-200 bg-white">

                <div class="border-b border-gray-200 p-6">
                    <div class="flex flex-col gap-5 sm:flex-row sm:items-center">

                        <!-- Avatar -->
                        <div class="flex size-20 shrink-0 items-center justify-center
    overflow-hidden rounded-full bg-indigo-50 text-sm font-bold
    text-indigo-700">
                            <img v-if="getStudentAvatarUrl(enrollment.student_id)"
                                :src="getStudentAvatarUrl(enrollment.student_id)!" alt="Profile photo"
                                class="size-full object-cover" />
                        </div>

                        <!-- Student Name -->
                        <div class="min-w-0 flex-1">
                            <h2 class="text-xl font-bold text-gray-900">
                                {{ enrollment.fullname }}
                            </h2>

                            <p class="mt-1 text-sm text-gray-500">
                                Student ID: {{ enrollment.student_id }}
                            </p>

                            <div class="mt-3 flex flex-wrap gap-2">
                                <span class="rounded-md bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                                    Enrollment ID: {{ enrollment.id }}
                                </span>

                                <span class="rounded-md bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                                    {{ enrollment.status }}
                                </span>
                            </div>
                        </div>

                    </div>
                </div>

                <!-- Student Contact -->
                <div class="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2">

                    <div>
                        <p class="text-sm text-gray-500">
                            Full Name
                        </p>

                        <p class="mt-1 font-semibold text-gray-900">
                            {{ enrollment.fullname }}
                        </p>
                    </div>

                    <div>
                        <p class="text-sm text-gray-500">
                            Phone Number
                        </p>

                        <p class="mt-1 font-semibold text-gray-900">
                            {{ enrollment.phone }}
                        </p>
                    </div>

                    <div class="sm:col-span-2">
                        <p class="text-sm text-gray-500">
                            Address
                        </p>

                        <p class="mt-1 font-semibold text-gray-900">
                            {{ enrollment.address || "Not provided" }}
                        </p>
                    </div>

                </div>
            </section>

            <!-- ================================================= -->
            <!-- ENROLLMENT INFORMATION -->
            <!-- ================================================= -->

            <section class="rounded-2xl border border-gray-200 bg-white p-6">

                <div class="mb-5">
                    <h2 class="text-lg font-bold text-gray-900">
                        Enrollment Information
                    </h2>

                    <p class="mt-1 text-sm text-gray-500">
                        Course registration details.
                    </p>
                </div>

                <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">

                    <div>
                        <p class="text-sm text-gray-500">
                            Course ID
                        </p>

                        <p class="mt-1 font-semibold text-gray-900">
                            {{ enrollment.course_id }}
                        </p>
                    </div>

                    <div>
                        <p class="text-sm text-gray-500">
                            Program ID
                        </p>

                        <p class="mt-1 font-semibold text-gray-900">
                            {{ enrollment.program_id }}
                        </p>
                    </div>

                    <div>
                        <p class="text-sm text-gray-500">
                            Registration Date
                        </p>

                        <p class="mt-1 font-semibold text-gray-900">
                            {{ registrationDate }}
                        </p>
                    </div>

                    <div>
                        <p class="text-sm text-gray-500">
                            Enrollment Date
                        </p>

                        <p class="mt-1 font-semibold text-gray-900">
                            {{ enrolledDate }}
                        </p>
                    </div>

                </div>
            </section>

            <!-- ================================================= -->
            <!-- EDUCATION INFORMATION -->
            <!-- ================================================= -->

            <section class="rounded-2xl border border-gray-200 bg-white p-6">

                <div class="mb-5">
                    <h2 class="text-lg font-bold text-gray-900">
                        Education Information
                    </h2>

                    <p class="mt-1 text-sm text-gray-500">
                        Student educational background.
                    </p>
                </div>

                <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">

                    <div>
                        <p class="text-sm text-gray-500">
                            Education Level
                        </p>

                        <p class="mt-1 font-semibold text-gray-900">
                            {{ enrollment.education_level || "Not provided" }}
                        </p>
                    </div>

                    <div>
                        <p class="text-sm text-gray-500">
                            School / Institution
                        </p>

                        <p class="mt-1 font-semibold text-gray-900">
                            {{ enrollment.school_name || "Not provided" }}
                        </p>
                    </div>

                </div>
            </section>

            <!-- ================================================= -->
            <!-- ENROLLMENT STATUS -->
            <!-- ================================================= -->

            <section class="rounded-2xl border border-gray-200 bg-white p-6">

                <div class="mb-5">
                    <h2 class="text-lg font-bold text-gray-900">
                        Enrollment Status
                    </h2>

                    <p class="mt-1 text-sm text-gray-500">
                        Current enrollment progress.
                    </p>
                </div>

                <div class="rounded-xl bg-gray-50 p-5">

                    <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <span class="text-base font-bold text-gray-900">
                            {{ enrollmentStatus }}
                        </span>

                        <span class="w-fit rounded-full px-3 py-1 text-xs font-semibold" :class="statusClass">
                            {{ enrollment.status.toUpperCase() }}
                        </span>
                    </div>

                    <p class="mt-2 text-sm leading-relaxed text-gray-600">
                        {{ statusDescription }}
                    </p>

                    <div v-if="enrollment.status === 'rejected' && enrollment.rejection_reason"
                        class="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
                        <p class="text-sm font-semibold text-red-700">
                            Rejection Reason
                        </p>

                        <p class="mt-1 text-sm text-red-600">
                            {{ enrollment.rejection_reason }}
                        </p>
                    </div>

                </div>

                <div class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">

                    <div>
                        <p class="text-sm text-gray-500">
                            Reviewed At
                        </p>

                        <p class="mt-1 font-medium text-gray-900">
                            {{ reviewedDate }}
                        </p>
                    </div>

                    <div>
                        <p class="text-sm text-gray-500">
                            Approved At
                        </p>

                        <p class="mt-1 font-medium text-gray-900">
                            {{ approvedDate }}
                        </p>
                    </div>

                    <div class="sm:col-span-2">
                        <p class="text-sm text-gray-500">
                            Last Updated
                        </p>

                        <p class="mt-1 font-medium text-gray-900">
                            {{ formatDate(enrollment.updated_at) }}
                        </p>
                    </div>

                </div>
            </section>

            <!-- ================================================= -->
            <!-- PAYMENT OVERVIEW PLACEHOLDER -->
            <!-- ================================================= -->

            <section class="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">

                <div
                    class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor" stroke-width="1.7">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M3 10h18M7 15h2m4 0h2m-9 5h12a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>

                <h2 class="mt-4 text-lg font-bold text-gray-900">
                    Payment Overview
                </h2>

                <p class="mx-auto mt-2 max-w-md text-sm text-gray-500">
                    Payment history, invoice information, and payment verification
                    will be available here.
                </p>

                <span class="mt-4 inline-flex rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-600">
                    Coming Soon
                </span>

            </section>

        </template>

    </main>
</template>
