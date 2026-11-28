<script setup lang="ts">
import CustomButton from '@/components/CustomButton.vue';
import { RouterView, useRouter } from 'vue-router';
import '@/assets/grid.css';
import { useLenis } from '@/composables/useLenis';

const router = useRouter();

useLenis();

</script>

<template>
    <div class="min-h-screen hero-grid">
        <main class="mx-auto space-y-8 py-8 px-4 sm:px-6 lg:px-8">
            <!-- Header -->
            <header class="flex items-center justify-between gap-4">
                <div>
                    <p class="text-[14px] font-bold text-primary">
                        STUDENT SPACE
                    </p>

                    <h1 class="mt-2 text-[30px] font-black tracking-tight text-text-primary sm:text-[36px]">
                        Discover your next course.
                    </h1>

                    <p class="mt-2 text-[14px] text-text-secondary">
                        Find the right course for your learning journey.
                    </p>
                </div>

                <div class="flex flex-row items-center gap-2">
                    <CustomButton variant="outline" @click="router.push('/student/enrollments')">My enrollments
                    </CustomButton>

                    <CustomButton variant="secondary" @click="router.push('/student/profile')">Profile</CustomButton>
                </div>
            </header>
            <RouterView />
        </main>
    </div>
</template>
