<script setup lang="ts">
import { useLenis } from '@/composables/useLenis.js';
import CoursesExplorer from './CoursesExplorer.vue';

useLenis();
</script>

<template>
    <main class=" mx-auto space-y-8 px-4 py-8 sm:px-6 lg:px-8 hero-grid">
        <CoursesExplorer />
    </main>
</template>

<style scoped>
.hero-grid {
    position: relative;
    isolation: isolate;
    background-color: #ffffff;

    background-image:
        linear-gradient(to right,
            rgba(255, 184, 77, 0.2) 1px,
            transparent 1px),
        linear-gradient(to bottom,
            rgba(118, 108, 240, 0.2) 1px,
            transparent 1px);

    background-size: 44px 44px;
    background-position: center top;
    background-repeat: repeat;

    background-attachment: fixed;
}

.hero-grid::before {
    content: "";
    position: fixed;
    inset: 0;
    z-index: -1;
    pointer-events: none;

    background: radial-gradient(ellipse at center,
            transparent 15%,
            rgba(255, 255, 255, 0.65) 70%,
            #ffffff 100%);
}
</style>