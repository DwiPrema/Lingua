<script setup>
import { RouterView } from 'vue-router';


</script>

<template>
    <div class="min-h-screen bg-slate-50">
        <main class="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
            <!-- Header -->
            <header class="flex items-center justify-between gap-4">
                <div>
                    <p class="text-sm font-medium text-violet-600">
                        STUDENT SPACE
                    </p>

                    <h1 class="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        Discover your next course.
                    </h1>

                    <p class="mt-2 text-sm text-slate-500">
                        Find the right course for your learning journey.
                    </p>
                </div>

                <div class="flex flex-row items-center gap-2">
                    <RouterLink to="/student/enrollments" class="hidden rounded-xl border border-slate-200 bg-white
                 px-4 py-2.5 text-sm font-medium text-slate-700
                 transition hover:bg-slate-100 sm:inline-flex">
                        My enrollments
                    </RouterLink>

                    <RouterLink to="/student/profile" class="hidden rounded-xl border border-slate-200 bg-white
                 px-4 py-2.5 text-sm font-medium text-slate-700
                 transition hover:bg-slate-100 sm:inline-flex">
                        My Profile
                    </RouterLink>
                </div>
            </header>
            <RouterView />
        </main>
    </div>
</template>
