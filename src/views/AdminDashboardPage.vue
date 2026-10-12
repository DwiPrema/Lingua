<script setup>
import { useCourseStores } from '@/stores/course_stores';
import { useOrganizationStore } from '@/stores/organization_stores';
import { computed } from 'vue';
import { RouterView } from 'vue-router';

const courseStore = useCourseStores();
const organizationStore = useOrganizationStore();

const loading = computed(() => courseStore.loading);

async function refreshDashboard() {
  try {
    await Promise.all([
      courseStore.fetchMyCourses(),
      organizationStore.fetchMyOrganization(),
    ]);
  } catch (err) {
    console.error("Failed to update dashboard:", err);
  }
}
</script>

<template>
  <main class="min-h-screen bg-light-text">
    <div class="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">

      <RouterView />
    </div>
  </main>
</template>