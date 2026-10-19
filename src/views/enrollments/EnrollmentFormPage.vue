
<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useCourseStores } from '@/stores/course_stores'
import { useCourseProgramStore } from '@/stores/course_program_stores'
import { useEnrollmentStores } from '@/stores/enrollments_stores'
import { StatusEnrollments } from '@/constant/enrollment_status'
import { EnrollmentException } from '@/utils/exception/enrollment_exception'
import { useAuthStore } from '@/stores/auth_stores'
import { formatCurrency } from '@/constant/format_currency'

const route = useRoute()
const router = useRouter()

const courseStore = useCourseStores()
const courseProgramStore = useCourseProgramStore()
const enrollmentStore = useEnrollmentStores()
const authStore = useAuthStore()

const course = ref(null)
const program = ref(null)

const loadingPage = ref(true)
const pageError = ref('')
const formError = ref('')
const showConfirmation = ref(false)

const form = reactive({
    fullname: '',
    phone: '',
    education_level: '',
    school_name: '',
    address: '',
})

const educationLevels = [
    'Elementary School',
    'Junior High School',
    'Senior High School',
    'University',
    'Other',
]

const courseId = computed(() => route.params.courseId)
const programId = computed(() => route.params.programId)

const studentId = computed(
    () => authStore.user?.id ?? authStore.session?.user?.id ?? null,
)

const registrationFee = computed(
    () => program.value?.registrationFee
        ?? program.value?.registration_fee
        ?? 0,
)

const monthlyFee = computed(
    () => program.value?.monthlyFee
        ?? program.value?.monthly_fee
        ?? 0,
)

onMounted(loadEnrollmentData)

async function loadEnrollmentData() {
    loadingPage.value = true
    pageError.value = ''

    try {
        if (!courseId.value || !programId.value) {
            throw new Error('Course or program information is missing.')
        }

        course.value = await courseStore.fetchCourseById(courseId.value)

        const programs =
            await courseProgramStore.getAllCourseProgram(courseId.value)

        program.value = programs.find(
            (item) => String(item.id) === String(programId.value),
        )

        if (!course.value) {
            throw new Error('Course not found.')
        }

        if (!program.value) {
            throw new Error('Program not found.')
        }
    } catch (err) {
        pageError.value =
            err?.message ?? 'Unable to load enrollment information.'
    } finally {
        loadingPage.value = false
    }
}

function validateForm() {
    if (!studentId.value) {
        formError.value = 'Please sign in before enrolling.'
        return false
    }

    if (
        !form.fullname.trim() ||
        !form.phone.trim() ||
        !form.education_level ||
        !form.school_name.trim() ||
        !form.address.trim()
    ) {
        formError.value = 'Please complete all required fields.'
        return false
    }

    if (!/^[+0-9\s()-]{8,20}$/.test(form.phone.trim())) {
        formError.value = 'Please enter a valid phone number.'
        return false
    }

    formError.value = ''
    return true
}

function reviewEnrollment() {
    if (!validateForm()) return
    showConfirmation.value = true
}

async function submitEnrollment() {
    if (enrollmentStore.submitting) return

    if (!validateForm()) {
        showConfirmation.value = false
        return
    }

    try {
        const payload = {
            student_id: studentId.value,
            course_id: course.value.id,
            program_id: program.value.id,
            fullname: form.fullname.trim(),
            phone: form.phone.trim(),
            education_level: form.education_level,
            school_name: form.school_name.trim(),
            address: form.address.trim(),

            status: StatusEnrollments.PENDING,
        }

        const enrollment = await enrollmentStore.addEnrollment(payload)

        showConfirmation.value = false

        await router.push({
            name: 'student.enrollment-detail',
            params: { enrollmentId: enrollment.id },
        })
    } catch (err) {
        if (err instanceof EnrollmentException) {
            formError.value = err.message
        } else {
            formError.value =
                enrollmentStore.error ??
                err?.message ??
                'Unable to submit your enrollment. Please try again.'
        }

        showConfirmation.value = false
    }
}
</script>

<template>
    <main class="min-h-screen bg-slate-50 py-10">
        <div class="mx-auto">
            <button
                type="button"
                class="mb-6 text-sm font-medium text-slate-600 hover:text-slate-950"
                @click="router.back()"
            >
                ← Back
            </button>

            <div v-if="loadingPage" class="animate-pulse space-y-5">
                <div class="h-8 w-56 rounded bg-slate-200" />
                <div class="h-36 rounded-2xl bg-slate-200" />
                <div class="h-96 rounded-2xl bg-slate-200" />
            </div>

            <div
                v-else-if="pageError"
                class="rounded-2xl border border-red-200 bg-white p-8 text-center"
            >
                <h1 class="text-xl font-bold text-slate-900">
                    Unable to load enrollment
                </h1>
                <p class="mt-2 text-sm text-alert">{{ pageError }}</p>

                <button
                    type="button"
                    class="mt-5 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
                    @click="loadEnrollmentData"
                >
                    Try Again
                </button>
            </div>

            <template v-else>
                <header class="mb-8">
                    <p class="text-sm font-semibold uppercase tracking-wider text-accent">
                        Student enrollment
                    </p>

                    <h1 class="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                        Your Enrollment
                    </h1>

                    <p class="mt-3 text-slate-600">
                        Review your selected course and program, then provide
                        your information to get started.
                    </p>
                </header>

                <!-- Course and program summary -->
                <section class="rounded-2xl border border-accent/10 bg-white p-6 shadow-sm">
                    <p class="text-xs font-bold uppercase tracking-widest text-accent">
                        Selected course
                    </p>

                    <h2 class="mt-2 text-2xl font-bold text-slate-900">
                        {{ course.name }}
                    </h2>

                    <p class="mt-2 text-sm leading-6 text-slate-600">
                        {{ course.description || 'No course description available.' }}
                    </p>

                    <div class="mt-5 rounded-xl bg-accent/25 p-4">
                        <p class="text-xs font-semibold text-accent">
                            Selected program
                        </p>
                        <p class="mt-1 font-bold text-slate-900">
                            {{ program.name }}
                        </p>
                    </div>

                    <div class="mt-4 grid gap-4 sm:grid-cols-2">
                        <div class="rounded-xl border border-slate-200 p-4">
                            <p class="text-sm text-slate-500">
                                Registration fee
                            </p>
                            <p class="mt-2 text-lg font-bold text-slate-900">
                                {{ formatCurrency(registrationFee) }}
                            </p>
                        </div>

                        <div class="rounded-xl border border-slate-200 p-4">
                            <p class="text-sm text-slate-500">
                                Monthly fee
                            </p>
                            <p class="mt-2 text-lg font-bold text-slate-900">
                                {{ formatCurrency(monthlyFee) }}
                            </p>
                        </div>
                    </div>
                </section>

                <!-- Student form -->
                <form
                    class="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
                    @submit.prevent="reviewEnrollment"
                >
                    <div class="mb-7">
                        <h2 class="text-xl font-bold text-slate-900">
                            Personal Information
                        </h2>
                        <p class="mt-2 text-sm text-slate-500">
                            Provide accurate information for the course
                            administrator to review your enrollment.
                        </p>
                    </div>

                    <div class="grid gap-5 sm:grid-cols-2">
                        <div class="sm:col-span-2">
                            <label for="fullname" class="mb-2 block text-sm font-semibold text-slate-700">
                                Full name <span class="text-red-500">*</span>
                            </label>
                            <input
                                id="fullname"
                                v-model="form.fullname"
                                type="text"
                                autocomplete="name"
                                maxlength="120"
                                required
                                placeholder="Enter your full name"
                                class="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-accent/70 focus:ring-2 focus:ring-accent/10"
                            />
                        </div>

                        <div>
                            <label for="phone" class="mb-2 block text-sm font-semibold text-slate-700">
                                Phone number <span class="text-red-500">*</span>
                            </label>
                            <input
                                id="phone"
                                v-model="form.phone"
                                type="tel"
                                autocomplete="tel"
                                maxlength="20"
                                required
                                placeholder="e.g. 08123456789"
                                class="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-accent/70 focus:ring-2 focus:ring-accent/10"
                            />
                        </div>

                        <div>
                            <label for="education" class="mb-2 block text-sm font-semibold text-slate-700">
                                Education level <span class="text-red-500">*</span>
                            </label>
                            <select
                                id="education"
                                v-model="form.education_level"
                                required
                                class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-accent/70 focus:ring-2 focus:ring-accent/10"
                            >
                                <option disabled value="">
                                    Select education level
                                </option>
                                <option
                                    v-for="level in educationLevels"
                                    :key="level"
                                    :value="level"
                                >
                                    {{ level }}
                                </option>
                            </select>
                        </div>

                        <div class="sm:col-span-2">
                            <label for="school" class="mb-2 block text-sm font-semibold text-slate-700">
                                School / Institution
                                <span class="text-red-500">*</span>
                            </label>
                            <input
                                id="school"
                                v-model="form.school_name"
                                type="text"
                                maxlength="150"
                                required
                                placeholder="Enter your school or institution"
                                class="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-accent/70 focus:ring-2 focus:ring-accent/10"
                            />
                        </div>

                        <div class="sm:col-span-2">
                            <label for="address" class="mb-2 block text-sm font-semibold text-slate-700">
                                Address <span class="text-red-500">*</span>
                            </label>
                            <textarea
                                id="address"
                                v-model="form.address"
                                rows="4"
                                maxlength="500"
                                required
                                placeholder="Enter your current address"
                                class="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-accent/70 focus:ring-2 focus:ring-accent/10"
                            />
                        </div>
                    </div>

                    <p
                        v-if="formError"
                        role="alert"
                        class="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                    >
                        {{ formError }}
                    </p>

                    <div class="mt-6 rounded-xl bg-amber-50 p-4">
                        <p class="text-sm leading-6 text-amber-900">
                            <strong>What happens next?</strong>
                            Your enrollment will be submitted with a pending
                            status for administrator review.
                        </p>
                    </div>

                    <button
                        type="submit"
                        class="mt-7 w-full rounded-xl bg-accent/90 px-5 py-3.5 font-semibold text-white transition hover:bg-accent focus:outline-none focus:ring-2 focus:ring-rose-300"
                    >
                        Review Enrollment
                    </button>
                </form>
            </template>
        </div>

        <!-- Confirmation modal -->
        <div
            v-if="showConfirmation"
            class="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 sm:items-center sm:p-4"
            @click.self="showConfirmation = false"
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirmation-title"
                class="w-full max-w-lg rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-2xl sm:p-8"
            >
                <div class="mx-auto mb-5 h-1.5 w-12 rounded-full bg-slate-200 sm:hidden" />

                <h2 id="confirmation-title" class="text-2xl font-bold text-slate-900">
                    Confirm Enrollment
                </h2>

                <p class="mt-2 text-sm leading-6 text-slate-600">
                    Please make sure your information is correct before
                    submitting.
                </p>

                <dl class="mt-6 divide-y divide-slate-100">
                    <div class="flex justify-between gap-4 py-3">
                        <dt class="text-sm text-slate-500">Full name</dt>
                        <dd class="text-right text-sm font-semibold text-slate-900">
                            {{ form.fullname }}
                        </dd>
                    </div>
                    <div class="flex justify-between gap-4 py-3">
                        <dt class="text-sm text-slate-500">Course</dt>
                        <dd class="text-right text-sm font-semibold text-slate-900">
                            {{ course?.name }}
                        </dd>
                    </div>
                    <div class="flex justify-between gap-4 py-3">
                        <dt class="text-sm text-slate-500">Program</dt>
                        <dd class="text-right text-sm font-semibold text-slate-900">
                            {{ program?.name }}
                        </dd>
                    </div>
                    <div class="flex justify-between gap-4 py-3">
                        <dt class="text-sm text-slate-500">Registration fee</dt>
                        <dd class="text-right text-sm font-semibold text-slate-900">
                            {{ formatCurrency(registrationFee) }}
                        </dd>
                    </div>
                    <div class="flex justify-between gap-4 py-3">
                        <dt class="text-sm text-slate-500">Monthly fee</dt>
                        <dd class="text-right text-sm font-semibold text-slate-900">
                            {{ formatCurrency(monthlyFee) }}
                        </dd>
                    </div>
                </dl>

                <div class="mt-7 flex flex-col-reverse gap-3 sm:flex-row">
                    <button
                        type="button"
                        class="flex-1 rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                        :disabled="enrollmentStore.submitting"
                        @click="showConfirmation = false"
                    >
                        Review Again
                    </button>

                    <button
                        type="button"
                        class="flex-1 rounded-xl bg-accent/90 px-4 py-3 font-semibold text-white hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
                        :disabled="enrollmentStore.submitting"
                        @click="submitEnrollment"
                    >
                        {{
                            enrollmentStore.submitting
                                ? 'Submitting...'
                                : 'Confirm & Submit'
                        }}
                    </button>
                </div>
            </section>
        </div>
    </main>
</template>
