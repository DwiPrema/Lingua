<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCourseStores } from '@/stores/course_stores'
import { Search } from '@lucide/vue'

const router = useRouter()
const courseStore = useCourseStores()

const searchQuery = ref('')
const sortBy = ref('newest')
const loadMoreSentinel = ref(null)
const sentinelVisible = ref(false)

let observer = null
let searchTimer = null

const courses = computed(() => courseStore.courses)

const formatDate = (date) => {
    if (!date) return null

    const parsedDate = new Date(date)

    if (Number.isNaN(parsedDate.getTime())) return null

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(parsedDate)
}

const openCourse = (id) => {
    router.push({
        name: 'student.course-detail',
        params: { id },
    })
}

const loadInitialCourses = () => {
    return courseStore.fetchAllCourseData({
        reset: true,
        search: searchQuery.value,
        sortBy: sortBy.value,
    })
}

const retryLoading = () => {
    return loadInitialCourses()
}

watch([searchQuery, sortBy], () => {
    clearTimeout(searchTimer)

    searchTimer = setTimeout(() => {
        loadInitialCourses()
    }, 300)
})

watch(
    [
        sentinelVisible,
        () => courseStore.exploreLoading,
        () => courseStore.exploreLoadingMore,
        () => courseStore.exploreHasMore,
        () => courseStore.exploreError,
    ],
    ([visible, loading, loadingMore, hasMore, error]) => {
        if (
            visible &&
            !loading &&
            !loadingMore &&
            hasMore &&
            !error
        ) {
            courseStore.fetchExploreCourses()
        }
    },
)

onMounted(() => {
    observer = new IntersectionObserver(
        ([entry]) => {
            sentinelVisible.value = entry.isIntersecting
        },
        {
            root: null,
            rootMargin: '300px 0px',
            threshold: 0,
        },
    )

    if (loadMoreSentinel.value) {
        observer.observe(loadMoreSentinel.value)
    }

    loadInitialCourses()
})

onBeforeUnmount(() => {
    clearTimeout(searchTimer)
    observer?.disconnect()
})
</script>

<template>
    <main class="min-h-screen bg-slate-50">
        <button type="button" class="mb-5 text-sm font-medium text-slate-500 hover:text-primary"
            @click="router.push('/')">
            &larr; Back to dashboard
        </button>
        <!-- Header -->
        <section class="border-b border-slate-200 bg-white">
            <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

                <p class="text-sm font-semibold uppercase tracking-wider
                           text-indigo-600">
                    Find Your Next Opportunity
                </p>

                <h1 class="mt-2 text-3xl font-bold tracking-tight
                           text-slate-900 sm:text-4xl">
                    Explore Courses
                </h1>

                <p class="mt-3 max-w-2xl text-base leading-7 text-slate-500">
                    Discover new skills and find a learning program that
                    matches your goals.
                </p>
            </div>
        </section>

        <section class="mx-auto max-w-7xl py-8">
            <!-- Search and Sorting -->
            <div class="flex flex-col gap-4 sm:flex-row
                       sm:items-center sm:justify-between">
                <div class="relative w-full sm:max-w-md">
                    <Search class="absolute left-4 top-1/2 h-5 w-5
                               -translate-y-1/2 text-slate-400" />

                    <input v-model="searchQuery" type="search" placeholder="Search courses by name..." class="w-full rounded-xl border border-slate-200
                               bg-white py-3 pl-11 pr-4 text-sm
                               outline-none transition
                               placeholder:text-slate-400
                               focus:border-indigo-500
                               focus:ring-4 focus:ring-indigo-100" />
                </div>

                <div class="flex items-center gap-3">
                    <label for="course-sort" class="shrink-0 text-sm text-slate-500">
                        Sort by
                    </label>

                    <select id="course-sort" v-model="sortBy" class="w-full rounded-xl border border-slate-200
                               bg-white px-4 py-3 text-sm font-medium
                               text-slate-700 outline-none
                               focus:border-indigo-500
                               focus:ring-4 focus:ring-indigo-100
                               sm:w-44">
                        <option value="newest">Newest</option>
                        <option value="name">Course Name</option>
                    </select>
                </div>
            </div>

            <!-- Results Heading -->
            <div class="mt-8 flex items-center justify-between gap-3">
                <div>
                    <h2 class="text-lg font-bold text-slate-900">
                        Available Courses
                    </h2>

                    <p class="mt-1 text-sm text-slate-500">
                        Explore programs and find your next learning experience.
                    </p>
                </div>

                <span class="shrink-0 rounded-full bg-white px-3 py-1.5
                           text-sm font-medium text-slate-600
                           ring-1 ring-slate-200">
                    {{ courses.length }}
                    {{ courses.length === 1 ? 'course' : 'courses' }}
                </span>
            </div>

            <!-- Initial Loading -->
            <div v-if="courseStore.exploreLoading && courses.length === 0"
                class="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div v-for="item in 9" :key="item" class="overflow-hidden rounded-2xl border
                           border-slate-200 bg-white">
                    <div class="h-40 animate-pulse bg-slate-200" />

                    <div class="space-y-3 p-5">
                        <div class="h-5 w-3/4 animate-pulse rounded bg-slate-200" />
                        <div class="h-4 w-full animate-pulse rounded bg-slate-100" />
                        <div class="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
                        <div class="mt-5 h-10 animate-pulse rounded-lg bg-slate-100" />
                    </div>
                </div>
            </div>

            <!-- Error State -->
            <div v-else-if="courseStore.exploreError && courses.length === 0" class="mt-6 rounded-2xl border border-red-200
                       bg-white px-6 py-12 text-center">
                <h3 class="text-lg font-bold text-slate-900">
                    Unable to Load Courses
                </h3>

                <p class="mt-2 text-sm text-slate-500">
                    {{ courseStore.exploreError }}
                </p>

                <button type="button" class="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5
                           text-sm font-semibold text-white
                           hover:bg-indigo-700" @click="retryLoading">
                    Try Again
                </button>
            </div>

            <!-- Empty State -->
            <div v-else-if="courses.length === 0 && !courseStore.exploreLoading" class="mt-6 rounded-2xl border border-dashed
                       border-slate-300 bg-white px-6 py-16 text-center">
                <h3 class="text-lg font-bold text-slate-900">
                    No Courses Found
                </h3>

                <p class="mt-2 text-sm text-slate-500">
                    {{
                        searchQuery
                            ? 'Try a different course name.'
                            : 'No courses are available right now. Please check back later.'
                    }}
                </p>

                <button v-if="searchQuery" type="button" class="mt-4 text-sm font-semibold text-indigo-600"
                    @click="searchQuery = ''">
                    Clear Search
                </button>
            </div>

            <!-- Course Grid -->
            <div v-else class="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <article v-for="course in courses" :key="course.id" class="group flex flex-col overflow-hidden rounded-2xl
                           border border-slate-200 bg-white transition
                           duration-200 hover:-translate-y-1
                           hover:border-indigo-200 hover:shadow-lg">

                    <!-- Course Information -->
                    <div class="flex flex-1 flex-col p-5">
                        <p v-if="course.created_at && formatDate(course.created_at)" class="text-xs text-slate-400">
                            Added {{ formatDate(course.created_at) }}
                        </p>

                        <h3 class="mt-3 line-clamp-2 text-lg font-bold
                                   text-slate-900 transition
                                   group-hover:text-indigo-600">
                            {{ course.name }}
                        </h3>

                        <p class="mt-2 line-clamp-3 flex-1 text-sm
                                   leading-6 text-slate-500">
                            {{
                                course.description ||
                                'Explore this course to learn more about its programs.'
                            }}
                        </p>

                        <div v-if="course.address" class="mt-4 flex items-start gap-2
                                   border-t border-slate-100 pt-4
                                   text-sm text-slate-500">
                            <svg class="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="1.8">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                                <circle cx="12" cy="10" r="2.5" />
                            </svg>

                            <span class="line-clamp-2">
                                {{ course.address }}
                            </span>
                        </div>

                        <button type="button" class="mt-5 flex w-full items-center
                                   justify-center gap-2 rounded-xl
                                   bg-indigo-600 px-4 py-3 text-sm
                                   font-semibold text-white transition
                                   hover:bg-indigo-700
                                   focus:outline-none focus:ring-4
                                   focus:ring-indigo-100" @click="openCourse(course.id)">
                            View Course Details

                            <svg class="h-4 w-4 transition-transform
                                       group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14m-7-7 7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </article>
            </div>

            <!-- Error While Loading More -->
            <div v-if="courseStore.exploreError && courses.length > 0" class="mt-6 rounded-xl border border-red-200
                       bg-white p-4 text-center">
                <p class="text-sm text-red-700">
                    Unable to load more courses.
                </p>

                <button type="button" class="mt-2 text-sm font-semibold text-indigo-600"
                    @click="courseStore.fetchExploreCourses()">
                    Try Again
                </button>
            </div>

            <!-- Loading More Indicator -->
            <div v-if="courseStore.exploreLoadingMore" class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div v-for="item in 3" :key="item" class="h-48 animate-pulse rounded-2xl bg-slate-200" />
            </div>

            <!-- End of Results -->
            <p v-else-if="
                courses.length > 0 &&
                !courseStore.exploreHasMore &&
                !courseStore.exploreLoading
            " class="py-10 text-center text-sm text-slate-400">
                You've reached the end of the course list.
            </p>

            <!-- Intersection Observer Target -->
            <div ref="loadMoreSentinel" class="h-8" aria-hidden="true" />
        </section>
    </main>
</template>
