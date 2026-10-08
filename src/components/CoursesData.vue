<script setup>
import { useCourseStores } from '@/stores/course_stores.js';
import { CircleX, MapPin } from '@lucide/vue';
import { onMounted } from 'vue';
import CourseCardSkeleton from './CourseCardSkeleton.vue';

const courseStore = useCourseStores()

onMounted(() => {
    courseStore.fetchCourseDataForLandingPreview()
})
</script>

<template>
    <!-- Loading state -->
    <div v-if="courseStore.loading" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <CourseCardSkeleton v-for="n in 6" :key="n" />
    </div>

    <!-- Error state  -->
    <div v-else-if="courseStore.error" class="flex flex-row gap-4 items-center justify-center lg:justify-start">
        <CircleX class="text-alert" :size="65" />
        <h1 class="text-center font-black text-3xl text-light-text">Sorry Something Went Wrong</h1>
    </div>

    <!-- Empty state  -->
    <div v-else-if="courseStore.courses.length === 0">
        <h1 class="text-center font-black text-3xl text-light-text lg:text-left">No Course Available yet.</h1>
    </div>

    <!-- Success state  -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="course in courseStore.courses" :key="course.id"
            class="group relative flex flex-col justify-between p-5 rounded-2xl bg-light-text border border-gray-100 shadow-sm hover:shadow-md hover:border-accent/30 transition-all duration-300">
            <div>
                <!-- Header & Badge Lokasi -->
                <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2.5 sm:gap-3 mb-3">
                    <h3
                        class="text-xl sm:text-2xl font-black text-dark-background group-hover:text-accent transition-colors duration-200 line-clamp-2 min-w-0">
                        {{ course.name }}
                    </h3>

                    <div
                        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold shrink-0 self-start max-w-full sm:max-w-[50%] min-w-0">
                        <MapPin :size="14" class="shrink-0" />
                        <span class="line-clamp-2 wrap-break-word leading-tight">{{ course.address }}</span>
                    </div>
                </div>

                <!-- Deskripsi -->
                <p class="text-gray-600 text-sm line-clamp-2 font-normal leading-relaxed mb-6">
                    {{ course.description }}
                </p>
            </div>

            <!-- Footer Actions -->
            <div class="flex items-center justify-between pt-4 border-t border-gray-300">
                <button class="cursor-pointer text-xs font-semibold text-gray-500 hover:text-accent transition-colors">
                    See Details →
                </button>

                <button
                    class="cursor-pointer px-4 py-2 rounded-lg bg-accent text-white text-xs font-bold hover:bg-accent/80 active:scale-95 transition-all duration-200 shadow-sm">
                    Join
                </button>
            </div>
        </div>
    </div>
</template>