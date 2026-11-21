<script setup lang="ts">
import Header from '@/components/Header.vue';
import { ArrowUpRight, BookOpenCheck, PackagePlus } from '@lucide/vue';
import { useRouter } from 'vue-router';
import { useUserDataStores } from '@/stores/user_data_stores';
import { computed, onMounted } from 'vue';
import { useCourseStores } from '@/stores/course_stores';
import StatsCard from '@/components/StatsCard.vue';
import CustomButton from '@/components/CustomButton.vue';
import AboutSection from '@/components/AboutSection.vue';
import { useLenis } from '@/composables/useLenis';
import Aos from 'aos';

const router = useRouter()
const userStore = useUserDataStores()
const courseStore = useCourseStores()

const coursesOwner = computed(() => userStore.statisticData?.total_course_owners)
const students = computed(() => userStore.statisticData?.total_students);
const courses = computed(() => courseStore.courses.length);

useLenis();

onMounted(async () => {
    Aos.init();
    await userStore.fetchLandingStatistics();
    await courseStore.fetchAllCourseData();
})

</script>

<template>
    <section class="hero-grid">
        <!-- HEADER  -->
        <Header />

        <!-- HERO SECTION  -->
        <section class="relative w-full pb-25">
            <div class="w-full relative px-5 sm:px-8 md:px-12 lg:px-8 mx-auto">
                <div class="flex flex-col w-full lg:flex-row gap-10 xl:gap-14 relative items-center justify-between">

                    <!-- LEFT: CONTENT -->
                    <div class="w-full lg:w-1/2 flex flex-col justify-center">

                        <div class="text-center lg:text-left">
                            <h1 class="text-text-primary font-extrabold text-4xl sm:text-5xl xl:text-6xl leading-tight">
                                Take the next step in your

                                <span class="inline-block p-1 bg-primary/15 rounded-md text-primary">
                                    learning journey.
                                </span>
                            </h1>
                        </div>

                        <p class="text-text-primary text-[18px] pt-8 text-center lg:text-left mx-auto lg:mx-0 max-w-xl"
                            data-aos="fade-in" data-aos-duration="2000">
                            Discover expert-led courses to expand your
                            knowledge, gain practical skills, and share your unique
                            insights with others along the way.
                        </p>

                        <!-- BUTTONS -->
                        <div class="flex pt-8 gap-3 flex-col sm:flex-row">
                            <CustomButton @click="router.push('/explore-courses')" class="cursor-pointer"
                                data-aos="fade-left">Find Courses
                            </CustomButton>

                            <CustomButton class="cursor-pointer" variant="outline" @click="router.push('/dashboard')"
                                data-aos="fade-left" data-aos-delay="300">
                                Become
                                Creator
                                <ArrowUpRight />
                            </CustomButton>
                        </div>
                    </div>

                    <!-- RIGHT: IMAGE -->
                    <div class="w-full lg:w-1/2 flex justify-center items-center" data-aos="fade-up-left">
                        <div class="w-full max-w-xl">
                            <img src="../assets/book_animation.svg" alt="Learning illustration"
                                class="block w-full h-auto object-contain" width="600" />
                        </div>
                    </div>
                </div>

                <div class="flex gap-3 max-w-2xl">
                    <StatsCard label="Course Owner" data-aos="fade-up" :value="coursesOwner ?? '-'" variant="default" />
                    <StatsCard label="Total Courses" data-aos="fade-up" data-aos-delay="300" :value="courses"
                        variant="primary" />
                    <StatsCard label="Total Learners" data-aos="fade-up" data-aos-delay="600" :value="students ?? '-'"
                        variant="accent" />
                </div>
            </div>

        </section>

        <!-- ABOUT  -->
        <AboutSection />


        <!-- How It Works Section -->
        <section id="how-it-works" class="pb-50 pt-25 relative w-full bg-secondary">
            <div
                class="w-full relative px-5 sm:px-8 md:px-12 lg:px-8 max-w-5xl lg:max-w-7xl mx-auto flex flex-col gap-20">
                <!-- Section Heading -->
                <div>
                    <p class="text-accent font-medium text-center">Your learning journey starts here.</p>
                    <h1 class="text-text-primary font-black text-5xl text-center">How It Works</h1>
                    <p class="mt-4 text-base leading-7 text-text-primary text-center">
                        Whether you want to learn something new or share your knowledge,
                        Lingua makes it simple to get started.
                    </p>
                </div>

                <!-- Two User Types -->
                <div class="grid gap-8 md:grid-cols-2">
                    <!-- Learner Card -->
                    <div class="rounded-3xl border border-gray-200 bg-surface p-8
                 transition duration-300 hover:-translate-y-1
                 hover:border-primary hover:shadow-lg sm:p-10">
                        <div class="mb-6 flex h-14 w-14 items-center justify-center
                   rounded-2xl bg-primary/15 text-primary">
                            <BookOpenCheck />
                        </div>

                        <h3 class="text-2xl font-bold text-text-primary">
                            For Learners
                        </h3>

                        <p class="mt-3 leading-7 text-text-secondary">
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
                                    <h4 class="font-semibold text-text-primary">Explore courses</h4>
                                    <p class="mt-1 text-sm leading-6 text-text-secondary">
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
                                    <h4 class="font-semibold text-text-primary">Enroll in a course</h4>
                                    <p class="mt-1 text-sm leading-6 text-text-secondary">
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
                                    <h4 class="font-semibold text-text-primary">Learn and grow</h4>
                                    <p class="mt-1 text-sm leading-6 text-text-secondary">
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
                    <div class="rounded-3xl border border-gray-200 bg-surface p-8
                 transition duration-300 hover:-translate-y-1
                 hover:border-blue-200 hover:shadow-lg sm:p-10">
                        <div class="mb-6 flex h-14 w-14 items-center justify-center
                   rounded-2xl bg-accent/15 text-accent">
                            <PackagePlus />
                        </div>

                        <h3 class="text-2xl font-bold text-text-primary">
                            For Creators
                        </h3>

                        <p class="mt-3 leading-7 text-text-secondary">
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
                                    <h4 class="font-semibold text-text-primary">Create your profile</h4>
                                    <p class="mt-1 text-sm leading-6 text-text-secondary">
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
                                    <h4 class="font-semibold text-text-primary">Publish a course</h4>
                                    <p class="mt-1 text-sm leading-6 text-text-secondary">
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
                                    <h4 class="font-semibold text-text-primary">Share your knowledge</h4>
                                    <p class="mt-1 text-sm leading-6 text-text-secondary">
                                        Connect with learners and help them develop new skills.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <a href="/dashboard" class="mt-8 inline-flex items-center gap-2 font-semibold
                   text-dark-background transition-all ease-in-out duration-300 hover:text-accent">
                            Become a Creator
                            <span aria-hidden="true">→</span>
                        </a>
                    </div>
                </div>
            </div>
        </section>


        <!-- Footer -->
        <section class="relative w-full flex flex-col border-t bg-secondary border-gray-600 p-12" id="contact">
            <div class="flex flex-col sm:flex-row sm:items-end gap-4 sm:justify-between justify-center items-start">
                <div class="flex flex-col gap-4">
                    <h1 class="text-white text-3xl font-black">Lingua<span class="text-accent">.</span></h1>

                    <div>
                        <h1 class="font-black text-text-primary text-left">Learn from others.
                        </h1>
                        <h1 class="font-black text-text-primary text-left">Share what you
                            know.</h1>
                    </div>
                </div>

                <div>
                    <p class="text-text-primary font-black text-[0.7rem]">All right reserved.</p>
                </div>
            </div>
        </section>
    </section>
</template>

<style scoped>
.hero-grid {
    position: relative;
    isolation: isolate;
    background-color: #ffffff;

    background-image:
        linear-gradient(to right,
            rgba(120, 120, 120, 0.15) 1px,
            transparent 1px),
        linear-gradient(to bottom,
            rgba(120, 120, 120, 0.15) 1px,
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