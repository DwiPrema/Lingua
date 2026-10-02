<script setup>
import CoursesData from '@/components/CoursesData.vue';
import Header from '@/components/Header.vue';

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

</script>

<template>

    <!-- HEADER  -->
    <Header />


    <!-- HERO SECTION  -->
    <section class="relative w-full pt-10 pb-25">
        <div class="absolute h-64 top-0 inset-x-0 flex items-start">
            <div class="w-2/3 h-24 bg-linear-to-br from-primary blur-2xl invisible opacity-40">

            </div>

            <div class="h-20 w-3/4 bg-linear-to-r from-primary opacity-40 blur-2xl"></div>
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
                        <button
                            class="bg-primary rounded-full sm:w-max m-auto lg:m-0 relative w-full sm:min-w-50 p-4 hover:bg-success hover:scale-103 transition-all ease-in-out duration-300">
                            <div class="flex flex-row gap-4 justify-center items-center relative">
                                <p class="text-light-text">Explore Course</p>
                            </div>
                        </button>
                        <button
                            class="border border-primary rounded-full sm:w-max m-auto lg:m-0 relative w-full sm:min-w-50 p-4 hover:scale-103 transition-all ease-in-out duration-300">
                            <div class="flex flex-row gap-4 justify-center items-center relative">
                                <p class="text-light-text">Become Creator</p>
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
                            <h1 class="text-white font-black text-5xl text-center"><span class="text-primary">One</span> Place. <span class="text-primary">Two</span> Posibilities.</h1>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 items-center gap-4 w-full lg:w-[70%] lg:m-auto sm:grid-cols-2">
                    <div v-for="data in aboutData2" :key="data.title" data-aos="fade-up">
                        <div class="bg-accent/80 rounded-xl p-6 flex flex-col gap-6">
                            <h1 class="font-bold text-white text-center text-2xl">{{ data.title }}</h1>

                            <div>
                                <p class="text-gray-300 font-[0.5rem] text-center" v-for="description in data.descriptions">{{ description }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>


    <!-- Courses Section  -->
    <section class="pb-25 pt-25 relative w-full" id="explore">
        <div class="w-full relative px-5 sm:px-8 md:px-12 lg:px-8 max-w-5xl lg:max-w-7xl mx-auto flex flex-col gap-20">
            <div>
                <p class="text-primary font-medium text-center lg:text-left">Explore</p>
                <h1 class="text-white font-black text-5xl text-center lg:text-left">Course.</h1>
            </div>
            <CoursesData />
        </div>
    </section>
</template>