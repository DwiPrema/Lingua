<script setup>
import {
  computed,
  onMounted,
  reactive,
  ref,
  watch,
} from "vue";
import { storeToRefs } from "pinia";
import { useRouter, useRoute } from "vue-router";
import {
  BookOpen,
  Plus,
  MapPin,
  FileText,
  Pencil,
} from "@lucide/vue";

import { useCourseStores } from "@/stores/course_stores";
import { useOrganizationStore } from "@/stores/organization_stores";

const router = useRouter();
const route = useRoute();

const courseStore = useCourseStores();
const organizationStore = useOrganizationStore();

const { loading, error } = storeToRefs(courseStore);
const { organization } = storeToRefs(organizationStore);

const courseId = computed(
  () => route.params.courseId ?? null,
);

const isEditMode = computed(
  () => Boolean(courseId.value),
);

const pageTitle = computed(() =>
  isEditMode.value
    ? "Edit Course"
    : "Create a New Course",
);

const pageDescription = computed(() =>
  isEditMode.value
    ? "Update the details of your course."
    : "Set up a new course for your organization.",
);

const submitLabel = computed(() =>
  isEditMode.value
    ? "Update Course"
    : "Add Course",
);

const organizationId = computed(
  () => organization.value?.id ?? "",
);

const initializing = ref(true);
const validationMessage = ref("");
const selectedCourse = ref(null);

const form = reactive({
  name: "",
  description: "",
  address: "",
});

function resetForm() {
  form.name = "";
  form.description = "";
  form.address = "";
  selectedCourse.value = null;
}

function populateForm(course) {
  selectedCourse.value = course;

  form.name = course.name ?? "";
  form.description = course.description ?? "";
  form.address = course.address ?? "";
}

// Load the course when entering edit mode.
// Also handles navigation between different course IDs.
watch(
  courseId,
  async (id) => {
    initializing.value = true;
    validationMessage.value = "";
    resetForm();

    try {
      if (id) {
        const course = await courseStore.fetchCourseById(id);
        populateForm(course);
      } else if (!organization.value) {
        await organizationStore.fetchMyOrganization();
      }
    } catch (err) {
      validationMessage.value =
        err.message ?? "Failed to initialize the course form.";
    } finally {
      initializing.value = false;
    }
  },
  { immediate: true },
);

function validateForm() {
  if (!form.name.trim() || !form.address.trim()) {
    validationMessage.value =
      "Please complete all required fields.";
    return false;
  }

  if (isEditMode.value && !selectedCourse.value?.id) {
    validationMessage.value =
      "Course data could not be found.";
    return false;
  }

  if (!isEditMode.value && !organizationId.value) {
    validationMessage.value =
      "Your organization could not be found. Please try again.";
    return false;
  }

  validationMessage.value = "";
  return true;
}

async function handleSubmit() {
  validationMessage.value = "";

  if (!validateForm()) return;

  const payload = {
    name: form.name.trim(),
    description: form.description.trim(),
    address: form.address.trim(),
  };

  try {
    if (isEditMode.value) {
      await courseStore.updateCourse({
        courseId: selectedCourse.value.id,
        ...payload,
      });
    } else {
      await courseStore.addCourse({
        ...payload,
        organizationId: organizationId.value,
      });
    }

    await router.push({ name: "dashboard" });
  } catch (err) {
    // Store error is displayed below.
    console.error("Failed to save course:", err);
  }
}

function handleCancel() {
  router.back();
}
</script>

<template>
  <div class="mx-auto space-y-6">
    <!-- Page Header -->
    <header class="flex items-start gap-4">
      <div class="min-w-0">
        <p class="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Courses / {{ isEditMode ? "Edit" : "Create" }}
        </p>

        <h1 class="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
          {{ pageTitle }}
        </h1>

        <p class="mt-2 text-sm text-gray-500">
          {{ pageDescription }}
        </p>
      </div>
    </header>

    <!-- Course Form Card -->
    <section class="rounded-2xl border border-gray-200 bg-white p-5
             shadow-sm sm:p-8">
      <div class="mb-8 flex items-center gap-4">
        <div class="flex h-12 w-12 shrink-0 items-center justify-center
                 rounded-xl bg-primary/20">
          <BookOpen :size="24" class="text-primary" />
        </div>

        <div>
          <h2 class="text-lg font-semibold text-gray-900">
            Course Information
          </h2>

          <p class="mt-1 text-sm text-gray-500">
            Enter the basic details of your course.
          </p>
        </div>
      </div>

      <!-- Initial loading -->
      <div v-if="initializing" class="flex items-center gap-3 py-10 text-sm text-gray-500">
        <span class="h-5 w-5 animate-spin rounded-full
                 border-2 border-gray-300 border-t-primary" />
        Loading course information...
      </div>

      <template v-else>
        <!-- Feedback -->
        <div v-if="validationMessage || error" role="alert" class="mb-6 rounded-xl border border-red-200 bg-red-50
                 p-4 text-sm text-red-700">
          {{ validationMessage || error }}
        </div>

        <form class="space-y-6" @submit.prevent="handleSubmit">
          <!-- Course Name -->
          <div>
            <label for="course-name" class="mb-2 block text-sm font-medium text-gray-700">
              Course Name <span class="text-red-600">*</span>
            </label>

            <input id="course-name" v-model="form.name" type="text" required maxlength="150"
              placeholder="e.g. English for Beginners" class="w-full rounded-xl border border-gray-300 px-4 py-3
                     text-sm outline-none transition
                     placeholder:text-gray-400 focus:border-primary
                     focus:ring-2 focus:ring-primary/10" />

            <p class="mt-2 text-xs text-gray-500">
              Choose a clear name that students can easily recognize.
            </p>
          </div>

          <!-- Description -->
          <div>
            <label for="course-description" class="mb-2 block text-sm font-medium text-gray-700">
              Description
            </label>

            <div class="relative">
              <FileText :size="18" class="absolute left-4 top-4 text-gray-400" />

              <textarea id="course-description" v-model="form.description" rows="5" maxlength="2000"
                placeholder="Describe what students will learn..." class="w-full resize-y rounded-xl border border-gray-300
                       py-3 pl-11 pr-4 text-sm outline-none transition
                       placeholder:text-gray-400 focus:border-primary
                       focus:ring-2 focus:ring-primary/10" />
            </div>

            <p class="mt-2 text-xs text-gray-500">
              Explain the learning objectives or topics covered.
            </p>
          </div>

          <!-- Address -->
          <div>
            <label for="course-address" class="mb-2 block text-sm font-medium text-gray-700">
              Address <span class="text-red-600">*</span>
            </label>

            <div class="relative">
              <MapPin :size="18" class="absolute left-4 top-3.5 text-gray-400" />

              <input id="course-address" v-model="form.address" type="text" required maxlength="500"
                placeholder="Enter the course location" class="w-full rounded-xl border border-gray-300 py-3
                       pl-11 pr-4 text-sm outline-none transition
                       placeholder:text-gray-400 focus:border-primary
                       focus:ring-2 focus:ring-primary/10" />
            </div>

            <p class="mt-2 text-xs text-gray-500">
              Provide the address where the course takes place.
            </p>
          </div>

          <!-- Actions -->
          <div class="flex flex-col-reverse gap-3 border-t border-gray-100
                   pt-6 sm:flex-row sm:justify-end">
            <button type="button" :disabled="loading" class="rounded-xl border border-gray-300 px-5 py-3
                     text-sm font-medium text-gray-700 transition
                     hover:bg-gray-50 disabled:cursor-not-allowed
                     disabled:opacity-50" @click="handleCancel">
              Cancel
            </button>

            <button type="submit" :disabled="loading || initializing" class="inline-flex items-center justify-center gap-2
                     rounded-xl bg-primary px-6 py-3 text-sm
                     font-semibold text-white transition hover:opacity-90
                     focus:outline-none focus:ring-2 focus:ring-primary
                     focus:ring-offset-2 disabled:cursor-not-allowed
                     disabled:opacity-60">
              <span v-if="loading" class="h-4 w-4 animate-spin rounded-full
                       border-2 border-white/40 border-t-white" />

              <Pencil v-else-if="isEditMode" :size="18" />
              <Plus v-else :size="18" />

              {{
                loading
                  ? (isEditMode
                    ? "Updating Course..."
                    : "Creating Course...")
                  : submitLabel
              }}
            </button>
          </div>
        </form>
      </template>
    </section>

    <p class="text-center text-xs text-gray-500">
      Fields marked <span class="text-red-600">*</span> are required.
    </p>
  </div>
</template>
