<script setup>
import { computed, reactive, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useRoute, useRouter } from "vue-router";

import {
    BookOpen,
    Plus,
    Pencil,
    FileText,
    Wallet,
    CreditCard,
} from "@lucide/vue";

import { useCourseStores } from "@/stores/course_stores";
import { useCourseProgramStore } from "@/stores/course_program_stores";

const route = useRoute();
const router = useRouter();

// STORES
const courseStore = useCourseStores();
const courseProgramStore = useCourseProgramStore();

// Reactive state from Pinia
const { loading, error } = storeToRefs(courseProgramStore);

// ROUTE PARAMETERS
const courseId = computed(() => route.params.courseId ?? null);
const programId = computed(() => route.params.programId ?? null);

// PAGE MODE
const isEditMode = computed(() => Boolean(programId.value));

const pageTitle = computed(() =>
    isEditMode.value ? "Edit Course Program" : "Create Course Program",
);

const pageDescription = computed(() =>
    isEditMode.value
        ? "Update the details and pricing of this program."
        : "Create a new learning program with its registration and monthly fees.",
);

const submitLabel = computed(() =>
    isEditMode.value ? "Update Program" : "Add Program",
);


const initializing = ref(true);
const validationMessage = ref("");
const selectedProgram = ref(null);
const course = ref(null);

const form = reactive({
    name: "",
    description: "",
    registrationFee: "",
    monthlyFee: "",
});

// RESET FORM
function resetForm() {
    form.name = "";
    form.description = "";
    form.registrationFee = "";
    form.monthlyFee = "";

    selectedProgram.value = null;
}

// FORMAT RUPIAH
function formatRupiah(value) {
    if (value === null || value === undefined || value === "") {
        return "";
    }

    const amount = Number(value);

    if (!Number.isFinite(amount)) {
        return "";
    }

    return new Intl.NumberFormat("id-ID", {
        maximumFractionDigits: 0,
    }).format(amount);
}

// PARSE AMOUNT
function parseAmount(value) {
    const digits = String(value).replace(/\D/g, "");

    return digits === "" ? null : Number(digits);
}

// HANDLE FEE INPUT
function handleFeeInput(field, value) {
    const digits = String(value).replace(/\D/g, "");

    if (!digits) {
        form[field] = "";
        return;
    }

    form[field] = formatRupiah(Number(digits));
}

// POPULATE FORM FOR EDIT MODE
function populateForm(program) {
    selectedProgram.value = program;

    form.name = program.name ?? "";
    form.description = program.description ?? "";
    form.registrationFee = formatRupiah(program.registration_fee);
    form.monthlyFee = formatRupiah(program.monthly_fee);
}

// INITIALIZE PAGE
watch(
    [courseId, programId],
    async ([currentCourseId, currentProgramId]) => {
        initializing.value = true;
        validationMessage.value = "";
        course.value = null;
        resetForm();

        try {
            if (!currentCourseId) {
                throw new Error("Course ID is missing.");
            }

            course.value = await courseStore.fetchCourseById(
                currentCourseId,
            );

            if (!course.value) {
                throw new Error("Course could not be found.");
            }

            if (currentProgramId) {
                const program =
                    await courseProgramStore.getCourseProgramById(
                        currentCourseId,
                        currentProgramId,
                    );

                const parentCourseId =
                    program.courseId ?? program.course_id;

                if (
                    parentCourseId != null &&
                    String(parentCourseId) !== String(currentCourseId)
                ) {
                    throw new Error(
                        "This program does not belong to the selected course.",
                    );
                }

                populateForm(program);
            }
        } catch (err) {
            validationMessage.value =
                err.message ?? "Failed to load course program.";
        } finally {
            initializing.value = false;
        }
    },
    { immediate: true },
);

// VALIDATE FORM
function validateForm() {
    if (!form.name.trim()) {
        validationMessage.value = "Program name is required.";
        return false;
    }

    if (!form.registrationFee.trim()) {
        validationMessage.value = "Registration fee is required.";
        return false;
    }

    if (!form.monthlyFee.trim()) {
        validationMessage.value = "Monthly fee is required.";
        return false;
    }

    const registrationFee = parseAmount(form.registrationFee);
    const monthlyFee = parseAmount(form.monthlyFee);

    if (
        registrationFee === null ||
        monthlyFee === null ||
        !Number.isSafeInteger(registrationFee) ||
        !Number.isSafeInteger(monthlyFee)
    ) {
        validationMessage.value = "Please enter valid fee amounts.";
        return false;
    }

    if (isEditMode.value && !selectedProgram.value?.id) {
        validationMessage.value = "Program data could not be found.";
        return false;
    }

    if (!course.value?.id) {
        validationMessage.value = "Course data could not be found.";
        return false;
    }

    validationMessage.value = "";
    return true;
}

// SUBMIT FORM
async function handleSubmit() {
    validationMessage.value = "";

    if (loading.value || initializing.value) {
        return;
    }

    if (!validateForm()) {
        return;
    }

    const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        registrationFee: parseAmount(form.registrationFee),
        monthlyFee: parseAmount(form.monthlyFee),
    };

    try {
        if (isEditMode.value) {
            await courseProgramStore.updateCourseProgram({
                programId: selectedProgram.value.id,
                ...payload,
            });
        } else {
            await courseProgramStore.addCourseProgram({
                courseId: course.value.id,
                ...payload,
                isActive: true,
            });
        }

        router.back();
    } catch (err) {
        console.error("Failed to save course program:", err);

        validationMessage.value =
            err.message ?? "Failed to save course program.";
    }
}

// CANCEL
function handleCancel() {
    router.back();
}
</script>

<template>
    <div class="mx-auto space-y-6">
        <!-- PAGE HEADER -->
        <header>
            <p class="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Courses / Programs /
                {{ isEditMode ? "Edit" : "Create" }}
            </p>

            <h1 class="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
                {{ pageTitle }}
            </h1>

            <p class="mt-2 text-sm text-gray-500">
                {{ pageDescription }}
            </p>

            <p v-if="course" class="mt-3 text-sm font-medium text-primary">
                Course: {{ course.name }}
            </p>
        </header>

        <!-- FORM CARD -->
        <section class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
            <div class="mb-8 flex items-center gap-4">
                <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/20">
                    <BookOpen :size="24" class="text-primary" />
                </div>

                <div>
                    <h2 class="text-lg font-semibold text-gray-900">
                        Program Information
                    </h2>

                    <p class="mt-1 text-sm text-gray-500">
                        Configure the program details and tuition fees.
                    </p>
                </div>
            </div>

            <!-- INITIAL LOADING -->
            <div v-if="initializing" class="flex items-center gap-3 py-10 text-sm text-gray-500">
                <span class="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
                Loading program information...
            </div>

            <template v-else>
                <!-- ERROR MESSAGE -->
                <div v-if="validationMessage || error" role="alert"
                    class="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {{ validationMessage || error }}
                </div>

                <form class="space-y-6" @submit.prevent="handleSubmit">
                    <!-- PROGRAM NAME -->
                    <div>
                        <label for="program-name" class="mb-2 block text-sm font-medium text-gray-700">
                            Program Name <span class="text-alert">*</span>
                        </label>

                        <input id="program-name" v-model="form.name" type="text" required maxlength="150"
                            placeholder="e.g. English Beginner - Monthly Class"
                            class="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/10" />

                        <p class="mt-2 text-xs text-gray-500">
                            Give this program a clear and recognizable name.
                        </p>
                    </div>

                    <!-- DESCRIPTION -->
                    <div>
                        <label for="program-description" class="mb-2 block text-sm font-medium text-gray-700">
                            Description
                        </label>

                        <div class="relative">
                            <FileText :size="18" class="absolute left-4 top-4 text-gray-400" />

                            <textarea id="program-description" v-model="form.description" rows="5" maxlength="2000"
                                placeholder="Describe the learning plan, facilities, or program details..."
                                class="w-full resize-y rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/10" />
                        </div>

                        <p class="mt-2 text-xs text-gray-500">
                            Explain what students can expect from this program.
                        </p>
                    </div>

                    <!-- PRICING -->
                    <div class="border-t border-gray-100 pt-6">
                        <div class="mb-5">
                            <h3 class="text-base font-semibold text-gray-900">
                                Program Pricing
                            </h3>

                            <p class="mt-1 text-sm text-gray-500">
                                Set the initial registration fee and recurring monthly fee.
                            </p>
                        </div>

                        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <!-- REGISTRATION FEE -->
                            <div>
                                <label for="registration-fee" class="mb-2 block text-sm font-medium text-gray-700">
                                    Registration Fee
                                    <span class="text-alert">*</span>
                                </label>

                                <div class="relative">
                                    <Wallet :size="18" class="absolute left-4 top-3.5 text-gray-400" />

                                    <span class="absolute left-11 top-3.5 text-sm font-medium text-gray-500">
                                        Rp
                                    </span>

                                    <input id="registration-fee" :value="form.registrationFee" type="text"
                                        inputmode="numeric" required placeholder="0"
                                        class="w-full rounded-xl border border-gray-300 py-3 pl-18 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/10"
                                        @input="
                                            handleFeeInput(
                                                'registrationFee',
                                                $event.target.value,
                                            )
                                            " />
                                </div>

                                <p class="mt-2 text-xs text-gray-500">
                                    One-time registration payment.
                                </p>
                            </div>

                            <!-- MONTHLY FEE -->
                            <div>
                                <label for="monthly-fee" class="mb-2 block text-sm font-medium text-gray-700">
                                    Monthly Fee
                                    <span class="text-alert">*</span>
                                </label>

                                <div class="relative">
                                    <CreditCard :size="18" class="absolute left-4 top-3.5 text-gray-400" />

                                    <span class="absolute left-11 top-3.5 text-sm font-medium text-gray-500">
                                        Rp
                                    </span>

                                    <input id="monthly-fee" :value="form.monthlyFee" type="text" inputmode="numeric"
                                        required placeholder="0"
                                        class="w-full rounded-xl border border-gray-300 py-3 pl-18 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/10"
                                        @input="
                                            handleFeeInput(
                                                'monthlyFee',
                                                $event.target.value,
                                            )
                                            " />
                                </div>

                                <p class="mt-2 text-xs text-gray-500">
                                    Recurring tuition paid every month.
                                </p>
                            </div>
                        </div>

                        <!-- PRICING SUMMARY -->
                        <div v-if="form.registrationFee || form.monthlyFee"
                            class="mt-6 rounded-xl border border-gray-100 bg-gray-50 p-4">
                            <p class="text-xs font-medium text-gray-500">
                                Pricing Summary
                            </p>

                            <div class="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p class="text-xs text-gray-500">
                                        Registration
                                    </p>

                                    <p class="mt-1 font-semibold text-gray-900">
                                        Rp {{ form.registrationFee || "0" }}
                                    </p>
                                </div>

                                <div>
                                    <p class="text-xs text-gray-500">
                                        Monthly tuition
                                    </p>

                                    <p class="mt-1 font-semibold text-gray-900">
                                        Rp {{ form.monthlyFee || "0" }}
                                        <span class="text-xs font-normal text-gray-500">
                                            / month
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- ACTIONS -->
                    <div class="flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
                        <button type="button" :disabled="loading"
                            class="rounded-xl border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            @click="handleCancel">
                            Cancel
                        </button>

                        <button type="submit" :disabled="loading || initializing"
                            class="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60">
                            <span v-if="loading"
                                class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />

                            <Pencil v-else-if="isEditMode" :size="18" />
                            <Plus v-else :size="18" />

                            {{
                                loading
                                    ? isEditMode
                                        ? "Updating Program..."
                                        : "Creating Program..."
                            : submitLabel
                            }}
                        </button>
                    </div>
                </form>
            </template>
        </section>

        <!-- REQUIRED FIELD NOTE -->
        <p class="text-center text-xs text-gray-500">
            Fields marked <span class="text-alert">*</span> are required.
        </p>
    </div>
</template>