<script setup>
import CoursesData from '@/components/CoursesData.vue';
import Header from '@/components/Header.vue';
import { BookOpenCheck, PackagePlus } from '@lucide/vue';
import { useRouter } from 'vue-router';

const aboutData = [
    {
        title: "Learner",
        description: "Discover courses and join the course anytime you want",
    },
    {
        title: "Creator",
        description: "Create course and share your knowledge.",
    }
]

const aboutData2 = [
    {
        title: "For Learners",
        descriptions: ["Discover courses", "Explore subjects", "Learn your way"],
    },
    {
        title: "For Creator",
        descriptions: ["Create your courses", "Reach Learners", "Share your knowledge"],
    }
]

const router = useRouter()

</script>

<template>

    <!-- HEADER  -->
    <Header />


    <!-- HERO SECTION  -->
    <section class="relative w-full pt-10 pb-25">
        <div class="absolute h-64 top-0 inset-x-0 flex items-start">
            <div class="w-2/3 h-24 bg-linear-to-br from-accent blur-2xl invisible opacity-40">

            </div>

            <div class="h-20 w-3/4 bg-linear-to-r from-accent opacity-40 blur-2xl"></div>
        </div>

        <div class="w-full relative px-5 sm:px-8 md:px-12 lg:px-8 max-w-5xl lg:max-w-7xl mx-auto">
            <div
                class="grid lg:grid-cols-2 gap-20 xl:gap-14 relative pt-24 lg:max-w-none max-w-2xl md:max-w-3xl mx-auto items-center">
                <div class="lg:py-6">
                    <div class="text-center lg:text-left">
                        <h1 class="text-light-text font-black text-5xl">Welcome to <span
                                class="text-primary font-black text-5xl">Lingua
                            </span>👋</h1>
                    </div>
                    <p class="text-muted-text pt-8 text-center lg:text-left m-auto lg:m-0 max-w-xl">
                        Take the next step in your learning journey. Discover expert-led courses to expand your
                        knowledge, gain practical skills, and share your unique insights with others along the way.
                    </p>
                    <div class="flex pt-8 gap-3 flex-col sm:flex-row">
                        <a href="/explore-courses"
                            class="bg-primary rounded-full sm:w-max m-auto lg:m-0 relative w-full sm:min-w-50 p-4 hover:bg-success hover:scale-103 transition-all ease-in-out duration-300">
                            <div class="flex flex-row gap-4 justify-center items-center relative">
                                <p class="text-light-text">Explore Course</p>
                            </div>
                        </a>
                        <button @click="router.push('/dashboard')"
                            class="border border-primary rounded-full sm:w-max m-auto lg:m-0 relative w-full sm:min-w-50 p-4 hover:scale-103 transition-all ease-in-out duration-300">
                            <div class="flex flex-row gap-4 justify-center items-center relative">
                                <p class="text-primary">Become Creator</p>
                            </div>
                        </button>
                    </div>
                </div>

                <!-- IMAGE -->
                <div class="lg:h-full md:flex">
                    <div
                        class="flex w-full h-96 min-h-96 lg:min-h-[none] lg:w-full lg:h-full items-center relative justify-center">
                        <div class="absolute h-full z-10">
                            <img src="../assets/ilustration_1.png" alt="" class="w-full h-full object-cover bg-center"
                                width="500" height="auto">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>


    <!-- ABOUT  -->
    <section class="pb-25 pt-25 relative w-full" id="about">
        <div class="w-full relative px-5 sm:px-8 md:px-12 lg:px-8 max-w-5xl lg:max-w-7xl mx-auto flex flex-col gap-20">

            <div class="grid grid-cols-1 md:grid-cols-2 gap-16 relative items-center justify-between">
                <div class="lg:h-full md:flex" data-aos="zoom-in">
                    <div
                        class="flex flex-col w-full lg:w-full lg:h-full items-center md:items-start relative justify-between gap-8">
                        <div class="flex flex-col gap-4">
                            <h1 class="text-white font-black text-5xl text-center md:text-left">About Lingua.</h1>
                            <p class="text-muted-text md:text-left text-center">Lingua is a learning marketplace
                                built to connect people
                                who want to learn with people who have something valuable to teach.</p>
                        </div>


                        <div>
                            <h1 class="font-black text-muted-text text-2xl md:text-left text-center">Learn from others.
                            </h1>
                            <h1 class="font-black text-muted-text text-2xl md:text-left text-center">Share what you
                                know.</h1>
                        </div>
                    </div>
                </div>

                <div class="flex flex-col gap-4">
                    <div v-for="data in aboutData" :key="data.title" data-aos="fade-up">
                        <div class="bg-accent/80 rounded-xl p-6 flex flex-col gap-6">
                            <h1 class="font-bold text-white text-2xl">{{ data.title }}</h1>

                            <p class="text-gray-300 font-[0.5rem]">{{ data.description }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="pb-25 pt-25 relative w-full">
        <div class="w-full relative px-5 sm:px-8 md:px-12 lg:px-8 max-w-5xl lg:max-w-7xl mx-auto flex flex-col gap-20">

            <div class="flex flex-col gap-16 relative">
                <div class="lg:h-full md:flex" data-aos="zoom-in">
                    <div
                        class="flex flex-col w-full lg:w-full lg:h-full items-center md:items-start relative justify-between gap-8">
                        <div class="flex flex-col gap-4 w-full">
                            <h1 class="text-white font-black text-5xl text-center"><span class="text-primary">One</span>
                                Place. <span class="text-primary">Two</span> Posibilities.</h1>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 items-center gap-4 w-full lg:w-[70%] lg:m-auto sm:grid-cols-2">
                    <div v-for="data in aboutData2" :key="data.title" data-aos="fade-up">
                        <div class="bg-accent/80 rounded-xl p-6 flex flex-col gap-6">
                            <h1 class="font-bold text-white text-center text-2xl">{{ data.title }}</h1>

                            <div>
                                <p class="text-gray-300 font-[0.5rem] text-center"
                                    v-for="description in data.descriptions">{{ description }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>


    <!-- Courses Section  -->
    <section class="pb-25 pt-25 relative w-full border-b-muted-text/50 border" id="explore">
        <div class="w-full relative px-5 sm:px-8 md:px-12 lg:px-8 max-w-5xl lg:max-w-7xl mx-auto flex flex-col gap-20">
            <div>
                <p class="text-primary font-medium text-center lg:text-left">Explore</p>
                <h1 class="text-white font-black text-5xl text-center lg:text-left">Course.</h1>
            </div>
            <CoursesData />
            <div class="w-full flex justify-end">
                <a href="/explore-courses" class="text-light-text font-medium text-center lg:text-right cursor-pointer hover:text-accent transition-all duration-300 ease-in-out">Explore More Courses →</a>
            </div>
        </div>
    </section>


    <!-- How It Works Section -->
    <section id="how-it-works" class="pb-25 pt-25 relative w-full">
        <div class="w-full relative px-5 sm:px-8 md:px-12 lg:px-8 max-w-5xl lg:max-w-7xl mx-auto flex flex-col gap-20">
            <!-- Section Heading -->
            <div>
                <p class="text-primary font-medium text-center">Your learning journey starts here.</p>
                <h1 class="text-white font-black text-5xl text-center">How It Works</h1>
                <p class="mt-4 text-base leading-7 text-muted-text text-center">
                    Whether you want to learn something new or share your knowledge,
                    Lingua makes it simple to get started.
                </p>
            </div>

            <!-- Two User Types -->
            <div class="grid gap-8 md:grid-cols-2">
                <!-- Learner Card -->
                <div class="rounded-3xl border border-gray-200 bg-light-text p-8
                 transition duration-300 hover:-translate-y-1
                 hover:border-primary hover:shadow-lg sm:p-10">
                    <div class="mb-6 flex h-14 w-14 items-center justify-center
                   rounded-2xl bg-primary/15 text-primary">
                        <BookOpenCheck />
                    </div>

                    <h3 class="text-2xl font-bold text-gray-900">
                        For Learners
                    </h3>

                    <p class="mt-3 leading-7 text-gray-500">
                        Discover new skills, explore your interests, and learn at your
                        own pace with courses created by passionate people.
                    </p>

                    <div class="mt-8 space-y-6">
                        <div class="flex gap-4">
                            <span class="flex h-9 w-9 shrink-0 items-center justify-center
                       rounded-full bg-primary/15 text-sm font-bold text-primary">
                                01
                            </span>
                            <div>
                                <h4 class="font-semibold text-gray-900">Explore courses</h4>
                                <p class="mt-1 text-sm leading-6 text-gray-500">
                                    Browse courses and find the right one for your goals.
                                </p>
                            </div>
                        </div>

                        <div class="flex gap-4">
                            <span class="flex h-9 w-9 shrink-0 items-center justify-center
                       rounded-full bg-primary/15 text-sm font-bold text-primary">
                                02
                            </span>
                            <div>
                                <h4 class="font-semibold text-gray-900">Enroll in a course</h4>
                                <p class="mt-1 text-sm leading-6 text-gray-500">
                                    Choose a course and register to begin your learning journey.
                                </p>
                            </div>
                        </div>

                        <div class="flex gap-4">
                            <span class="flex h-9 w-9 shrink-0 items-center justify-center
                       rounded-full bg-primary/15 text-sm font-bold text-primary">
                                03
                            </span>
                            <div>
                                <h4 class="font-semibold text-gray-900">Learn and grow</h4>
                                <p class="mt-1 text-sm leading-6 text-gray-500">
                                    Build your knowledge and develop practical skills.
                                </p>
                            </div>
                        </div>
                    </div>

                    <a href="/explore-courses" class="mt-8 inline-flex items-center gap-2 font-semibold
                   text-dark-background transition-all ease-in-out duration-300 hover:text-primary">
                        Explore Courses
                        <span aria-hidden="true">→</span>
                    </a>
                </div>

                <!-- Creator Card -->
                <div class="rounded-3xl border border-gray-200 bg-light-text p-8
                 transition duration-300 hover:-translate-y-1
                 hover:border-blue-200 hover:shadow-lg sm:p-10">
                    <div class="mb-6 flex h-14 w-14 items-center justify-center
                   rounded-2xl bg-accent/15 text-accent">
                        <PackagePlus />
                    </div>

                    <h3 class="text-2xl font-bold text-gray-900">
                        For Creators
                    </h3>

                    <p class="mt-3 leading-7 text-gray-500">
                        Turn your knowledge into valuable learning experiences and
                        help others grow by sharing what you know.
                    </p>

                    <div class="mt-8 space-y-6">
                        <div class="flex gap-4">
                            <span class="flex h-9 w-9 shrink-0 items-center justify-center
                       rounded-full bg-accent/15 text-sm font-bold text-accent">
                                01
                            </span>
                            <div>
                                <h4 class="font-semibold text-gray-900">Create your profile</h4>
                                <p class="mt-1 text-sm leading-6 text-gray-500">
                                    Set up your creator profile and introduce your expertise.
                                </p>
                            </div>
                        </div>

                        <div class="flex gap-4">
                            <span class="flex h-9 w-9 shrink-0 items-center justify-center
                       rounded-full bg-accent/15 text-sm font-bold text-accent">
                                02
                            </span>
                            <div>
                                <h4 class="font-semibold text-gray-900">Publish a course</h4>
                                <p class="mt-1 text-sm leading-6 text-gray-500">
                                    Organize your knowledge into a course learners can discover.
                                </p>
                            </div>
                        </div>

                        <div class="flex gap-4">
                            <span class="flex h-9 w-9 shrink-0 items-center justify-center
                       rounded-full bg-accent/15 text-sm font-bold text-accent">
                                03
                            </span>
                            <div>
                                <h4 class="font-semibold text-gray-900">Share your knowledge</h4>
                                <p class="mt-1 text-sm leading-6 text-gray-500">
                                    Connect with learners and help them develop new skills.
                                </p>
                            </div>
                        </div>
                    </div>

                    <a href="/become-creator" class="mt-8 inline-flex items-center gap-2 font-semibold
                   text-dark-background transition-all ease-in-out duration-300 hover:text-accent">
                        Become a Creator
                        <span aria-hidden="true">→</span>
                    </a>
                </div>
            </div>
        </div>
    </section>


    <!-- Footer -->
    <section class="mt-15 relative w-full flex flex-col border-t border-gray-600 p-12" id="contact">
        <div class="flex flex-col sm:flex-row sm:items-end gap-4 sm:justify-between justify-center items-start">
            <div class="flex flex-col gap-4">
                <h1 class="text-white text-3xl font-black">Lingua<span class="text-primary">.</span></h1>

                <div>
                    <h1 class="font-black text-muted-text text-left">Learn from others.
                    </h1>
                    <h1 class="font-black text-muted-text text-left">Share what you
                        know.</h1>
                </div>
            </div>

            <div>
                <p class="text-muted-text font-black text-[0.7rem]">All right reserved.</p>
            </div>
        </div>
    </section>
</template>