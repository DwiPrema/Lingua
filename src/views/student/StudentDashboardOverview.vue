<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useCourseStores } from '@/stores/course_stores'
import { MapPin } from '@lucide/vue'
import CustomButton from '@/components/CustomButton.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const courseStore = useCourseStores()
const { courses, loading, error } = storeToRefs(courseStore)

const searchQuery = ref<string>('')

onMounted(async () => {
    await courseStore.fetchAllCourseData()
})

const filteredCourses = computed(() => {
    const query = searchQuery.value.trim().toLowerCase()

    if (!query) return courses.value.slice(0, 6)

    return courses.value
        .filter((course) => {
            const name = course.name?.toLowerCase() ?? ''
            const description = course.description?.toLowerCase() ?? ''
            const address = course.address?.toLowerCase() ?? ''

            return (
                name.includes(query) ||
                description.includes(query) ||
                address.includes(query)
            )
        })
        .slice(0, 6)
})
</script>

<template>

    <!-- Hero -->
    <section class="relative overflow-hidden rounded-3xl bg-secondary
               px-6 py-6 text-white sm:px-10 sm:py-10 border-2 border-text-primary">
        <div class="relative z-10">
            <p class="text-[12px] font-bold text-surface">
                YOUR LEARNING JOURNEY STARTS HERE
            </p>

            <h2 class="mt-3 text-[30px] font-black leading-tight sm:text-4xl">
                Learn something new, every day.
            </h2>

            <p class="mt-4 mb-4 max-w-lg text-[14px] text-surface">
                Explore available courses, discover learning opportunities,
                and find a program that matches your goals.
            </p>
        </div>

        <div class="pointer-events-none absolute -right-12 -top-20
                 h-64 w-64 rounded-full border-32
                 border-primary/40" />
        <div class="pointer-events-none absolute -bottom-28 right-32
                 h-56 w-56 rounded-full bg-primary/60" />

        <div class="relative z-10 justify-end items-end flex h-full">
            <CustomButton @click="router.push('/student/explore')" variant="outline"
                class="text-surface hover:text-primary-hover cursor-pointer transition-all duration-300 ease-in-out">
                Explore
                courses <span aria-hidden="true">→</span>
            </CustomButton>
        </div>
    </section>

    <!-- Search -->
    <section class="space-y-4">
        <div>
            <h2 class="text-xl font-bold text-text-primary">
                Explore courses
            </h2>
            <p class="mt-1 text-sm text-text-secondary">
                Find a course that fits your interests.
            </p>
        </div>

        <div class="relative max-w-2xl">
            <span class="pointer-events-none absolute inset-y-0 left-4
                   flex items-center text-text-secondary" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="h-5 w-5">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m16 16 4 4" />
                </svg>
            </span>

            <input v-model="searchQuery" type="search" placeholder="Search courses by name, description, or location..."
                class="w-full rounded-xl border border-text-primary
                   bg-white py-3.5 pl-12 pr-4 text-sm
                   text-text-primary outline-none transition
                   placeholder:text-text-secondary
                   focus:border-secondary focus:ring-4
                   focus:ring-violet-500/10" />
        </div>
    </section>

    <!-- Course list -->
    <section>
        <div class="mb-5 flex items-center justify-between gap-4">
            <h2 class="text-lg font-bold text-text-primary">
                {{ searchQuery ? 'Search results' : 'Available courses' }}
            </h2>

            <RouterLink to="/student/explore" class="text-sm font-semibold text-primary hover:text-primary-hover">
                View all →
            </RouterLink>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div v-for="n in 6" :key="n" class="animate-pulse rounded-2xl border border-slate-200
                   bg-surface p-5">
                <div class="h-32 rounded-xl bg-slate-100" />
                <div class="mt-4 h-5 w-3/4 rounded bg-slate-100" />
                <div class="mt-3 h-4 w-full rounded bg-slate-100" />
                <div class="mt-2 h-4 w-2/3 rounded bg-slate-100" />
            </div>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="rounded-2xl border border-red-200 bg-red-50 p-6">
            <p class="font-semibold text-alert">
                Unable to load courses
            </p>
            <p class="mt-1 text-sm text-alert">
                {{ error }}
            </p>

            <button type="button" class="mt-4 rounded-lg bg-white px-4 py-2
                   text-sm font-semibold text-alert
                   ring-1 ring-red-200 hover:bg-red-100" @click="courseStore.fetchMyCourses()">
                Try again
            </button>
        </div>

        <!-- Empty state -->
        <div v-else-if="filteredCourses.length === 0" class="rounded-2xl border border-dashed border-slate-300
                 bg-white px-6 py-14 text-center">
            <div class="mx-auto flex h-14 w-14 items-center justify-center
                   rounded-2xl bg-violet-50 text-2xl">
                🔎
            </div>

            <h3 class="mt-4 font-semibold text-text-primary">
                No courses found
            </h3>

            <p class="mt-2 text-sm text-text-secondary">
                Try another keyword or check back later.
            </p>
        </div>

        <!-- Courses -->
        <div v-else class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <article v-for="course in filteredCourses" :key="course.id"
                class="group flex flex-col overflow-hidden rounded-2xl
                   border border-text-primary bg-surface
                   hover:-translate-y-1 hover:border-secondary
                   hover:shadow-lg hover:shadow-slate-200/60 group grayscale transition-all duration-500 hover:grayscale-0">

                <div class="flex flex-1 flex-col p-5">
                    <h3 class="text-lg font-bold text-text-primary
                       transition group-hover:text-primary">
                        {{ course.name }}
                    </h3>

                    <p class="mt-2 line-clamp-3 text-sm leading-6 text-text-secondary">
                        {{ course.description || 'Explore this course to learn more.' }}
                    </p>

                    <div v-if="course.address" class="mt-4 flex items-center gap-1 text-sm text-text-secondary">
                        <MapPin :size="16" />
                        <span>{{ course.address }}</span>
                    </div>

                    <div class="mt-auto pt-5">
                        <RouterLink :to="`/student/courses/${course.id}`" class="flex w-full items-center justify-center gap-2
                         rounded-xl border border-secondary px-4 py-3
                         text-sm font-semibold text-surface/80
                         bg-secondary group-hover:text-surface hover:bg-primary
                         transition-all duration-300 ease-in-out">
                            View course details
                            <span aria-hidden="true">→</span>
                        </RouterLink>
                    </div>
                </div>
            </article>
        </div>
    </section>
</template>