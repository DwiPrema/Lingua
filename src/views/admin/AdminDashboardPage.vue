<script setup>
import { RouterView } from 'vue-router';
import '@/assets/grid.css';

</script>

<template>
  <main class="min-h-screen hero-grid">
    <div class="mx-auto space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <RouterView />
    </div>
  </main>
</template>