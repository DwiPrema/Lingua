<script setup>
import Header from '@/components/Header.vue';
import HeroSection from '@/components/HeroSection.vue';

</script>

<template>
    <Header />
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
</template>