<script setup lang="ts">
import { useLenis } from '@/composables/useLenis.js';
import CoursesExplorer from './CoursesExplorer.vue';
import "@/assets/grid.css"
useLenis();
</script>

<template>
    <main class=" mx-auto space-y-8 px-4 py-8 sm:px-6 lg:px-8 hero-grid">
        <CoursesExplorer />
    </main>
</template>