<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import {
  ArrowLeft,
  BookOpen,
  Plus,
  MapPin,
  FileText,
} from "@lucide/vue";

import { useCourseStores } from "@/stores/course_stores";
import { useOrganizationStore } from "@/stores/organization_stores";

const router = useRouter();

const courseStore = useCourseStores();
const organizationStore = useOrganizationStore();

const { loading, error } = storeToRefs(courseStore);
const { organization } = storeToRefs(organizationStore);

const successMessage = ref("");
const validationMessage = ref("");

const form = reactive({
  name: "",
  description: "",
  address: "",
});

const organizationId = computed(() => organization.value?.id ?? "");

onMounted(async () => {
  if (!organization.value) {
    try {
      await organizationStore.fetchMyOrganization();
    } catch {
      // Organization store exposes its error.
    }
  }
});

function validateForm() {
  if (!form.name.trim() || !form.address.trim()) {
    validationMessage.value =
      "Please complete all required fields.";
    return false;
  }

  if (!organizationId.value) {
    validationMessage.value =
      "Your organization could not be found. Please try again.";
    return false;
  }

  validationMessage.value = "";
  return true;
}

async function handleSubmit() {
  successMessage.value = "";
  validationMessage.value = "";

  if (!validateForm()) {
    return;
  }

  try {
    await courseStore.addCourse({
      name: form.name.trim(),
      description: form.description.trim(),
      address: form.address.trim(),
      organizationId: organizationId.value,
    });

    successMessage.value = "Course created successfully.";

    // Optional: navigate back after a successful save.
    router.push({ name: "dashboard" });
  } catch {
    // The store should expose the error through `error`.
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
            Courses / Create
          </p>
          <h1 class="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
            Create a New Course
          </h1>
          <p class="mt-2 text-sm text-gray-500">
            Set up a new course for your organization.
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

        <!-- Feedback -->
        <div
          v-if="validationMessage || error"
          role="alert"
          class="mb-6 rounded-xl border border-red-200 bg-red-50
                 p-4 text-sm text-red-700"
        >
          {{ validationMessage || error }}
        </div>

        <form class="space-y-6" @submit.prevent="handleSubmit">
          <!-- Course Name -->
          <div>
            <label
              for="course-name"
              class="mb-2 block text-sm font-medium text-gray-700"
            >
              Course Name <span class="text-red-600">*</span>
            </label>

            <input
              id="course-name"
              v-model="form.name"
              type="text"
              required
              maxlength="150"
              placeholder="e.g. English for Beginners"
              class="w-full rounded-xl border border-gray-300 px-4 py-3
                     text-sm outline-none transition
                     placeholder:text-gray-400
                     focus:border-primary focus:ring-2
                     focus:ring-primary/10"
            />
            <p class="mt-2 text-xs text-gray-500">
              Choose a clear name that students can easily recognize.
            </p>
          </div>

          <!-- Description -->
          <div>
            <label
              for="course-description"
              class="mb-2 block text-sm font-medium text-gray-700"
            >
              Description
            </label>

            <div class="relative">
              <FileText
                :size="18"
                class="absolute left-4 top-4 text-gray-400"
              />
              <textarea
                id="course-description"
                v-model="form.description"
                rows="5"
                maxlength="2000"
                placeholder="Describe what students will learn..."
                class="w-full resize-y rounded-xl border border-gray-300
                       py-3 pl-11 pr-4 text-sm outline-none transition
                       placeholder:text-gray-400 focus:border-primary
                       focus:ring-2 focus:ring-primary/10"
              />
            </div>
            <p class="mt-2 text-xs text-gray-500">
              Explain the learning objectives or topics covered.
            </p>
          </div>

          <!-- Address -->
          <div>
            <label
              for="course-address"
              class="mb-2 block text-sm font-medium text-gray-700"
            >
              Address <span class="text-red-600">*</span>
            </label>

            <div class="relative">
              <MapPin
                :size="18"
                class="absolute left-4 top-3.5 text-gray-400"
              />
              <input
                id="course-address"
                v-model="form.address"
                type="text"
                required
                maxlength="500"
                placeholder="Enter the course location"
                class="w-full rounded-xl border border-gray-300 py-3
                       pl-11 pr-4 text-sm outline-none transition
                       placeholder:text-gray-400 focus:border-primary
                       focus:ring-2 focus:ring-primary/10"
              />
            </div>
            <p class="mt-2 text-xs text-gray-500">
              Provide the address where the course takes place.
            </p>
          </div>

          <!-- Actions -->
          <div class="flex flex-col-reverse gap-3 border-t border-gray-100
                      pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              :disabled="loading"
              class="rounded-xl border border-gray-300 px-5 py-3
                     text-sm font-medium text-gray-700 transition
                     hover:bg-gray-50 disabled:cursor-not-allowed
                     disabled:opacity-50"
              @click="handleCancel"
            >
              Cancel
            </button>

            <button
              type="submit"
              :disabled="loading"
              class="inline-flex items-center justify-center gap-2
                     rounded-xl bg-primary px-6 py-3 text-sm
                     font-semibold text-white transition
                     hover:opacity-90 focus:outline-none
                     focus:ring-2 focus:ring-primary focus:ring-offset-2
                     disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span
                v-if="loading"
                class="h-4 w-4 animate-spin rounded-full
                       border-2 border-white/40 border-t-white"
              />

              <Plus v-else :size="18" />

              {{ loading ? "Creating Course..." : "Add Course" }}
            </button>
          </div>
        </form>
      </section>

      <p class="text-center text-xs text-gray-500">
        Fields marked <span class="text-red-600">*</span> are required.
      </p>
    </div>
</template>