<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from "vue";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";
import { useRouter } from "vue-router";
import { ChevronRight, MapPin } from "@lucide/vue";
import { useCourseStores } from "@/stores/course_stores";

gsap.registerPlugin(ScrollTrigger, Flip);

const router = useRouter();
const courseStore = useCourseStores();

const MOBILE_QUERY = "(max-width: 1023px)";
const FLIP_PROPS = "fontSize,letterSpacing";
const RESIZE_DEBOUNCE_MS = 300;

const INTRO_SCROLL_DISTANCE = 1500;
const HERO_TEXT_SCROLL_DISTANCE = 1000;
const EXPLORE_REVEAL_SCROLL_DISTANCE = 500;
const COURSE_CARDS_REVEAL_SCROLL_DISTANCE = 200;
const HORIZONTAL_SCROLL_MULTIPLIER = 1.2;
const HORIZONTAL_END_DELAY = 500;

const introParagraphs = [
    "Lingua is a learning marketplace designed to connect curious minds with course providers and learning opportunities.",
    "We believe everyone deserves the opportunity to explore new interests, develop meaningful skills, and discover a learning experience that inspires them to grow.",
];

const roles = [
    {
        title: "Learner",
        description: "Discover courses and join the course anytime you want",
        features: ["Discover courses", "Explore subjects", "Learn your way"],
        cardClass: "border-[#252525] bg-secondary",
        dividerClass: "border-text-primary/50",
    },
    {
        title: "Creator",
        description: "Create course and share your knowledge.",
        features: ["Create your courses", "Reach Learners", "Share your knowledge"],
        cardClass: "border-text-primary bg-accent",
        dividerClass: "border-black/50",
    },
];

const cardClass = {
    collapsed: "flex h-22.75 items-center justify-between gap-5 p-4 md:px-5.5",
    expanded:
        "grid h-auto grid-cols-1 items-stretch gap-5 p-5 sm:grid-cols-2 sm:gap-6 lg:h-40.5 lg:gap-8 lg:p-6",
};

const cardTitleClass = {
    collapsed: "mb-3 text-lg",
    expanded: "mb-3 text-[clamp(26px,2.5vw,34px)] lg:mb-6",
};

const cardDescClass = {
    collapsed: "text-[11px]",
    expanded: "text-base",
};

const cardFeaturesClass = {
    collapsed: "invisible absolute right-0 top-0 opacity-0",
    expanded: "static gap-3 border-l pl-4 sm:pl-6 lg:pl-10",
};

const introGridClass = {
    collapsed: "grid-cols-1 md:grid-cols-[0.9fr_1.1fr]",
    expanded: "grid-cols-1 content-start",
};

const introCopyClass = {
    collapsed: "relative",
    expanded: "relative lg:pointer-events-none lg:absolute lg:left-0 lg:top-0",
};

const heroEyebrowClass = {
    collapsed: "text-[clamp(40px,4.8vw,69px)]",
    expanded: "text-xl sm:text-2xl lg:text-[clamp(18px,1.9vw,28px)]",
};

const heroTitleClass = {
    collapsed: "ml-[30%] mt-12 text-[clamp(14px,1.45vw,21px)]",
    expanded:
        "ml-0 mt-4 text-[26px] sm:text-4xl lg:text-[clamp(32px,3.6vw,52px)]",
};

const heroRef = ref<HTMLElement | null>(null);
const introRef = ref<HTMLElement | null>(null);
const viewportRef = ref<HTMLElement | null>(null);
const trackRef = ref<HTMLElement | null>(null);

const isHeroExpanded = ref(false);
const isIntroExpanded = ref(false);

let ctx: gsap.Context | undefined;
let resizeTimer: ReturnType<typeof setTimeout> | undefined;
let buildId = 0;
let lastWidth = 0;

const isMobile = () => window.matchMedia(MOBILE_QUERY).matches;

function showExpandedLayout() {
    isHeroExpanded.value = true;
    isIntroExpanded.value = true;
}

function captureFlipState(targets: Array<Element | null>) {
    return Flip.getState(targets.filter(Boolean) as HTMLElement[], {
        props: FLIP_PROPS,
    });
}

function createFlipTween(
    state: ReturnType<typeof Flip.getState>,
    duration = 1
) {
    return Flip.from(state, {
        duration,
        ease: "power2.inOut",
        scale: false,
        props: FLIP_PROPS,
    });
}

function createPinnedTimeline(trigger: HTMLElement, scrollDistance: number) {
    return gsap.timeline({
        scrollTrigger: {
            trigger,
            start: "top top",
            end: `+=${scrollDistance}`,
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
        },
    });
}


async function buildAnimation() {
    const id = ++buildId;

    const hero = heroRef.value;
    const intro = introRef.value;

    if (!hero || !intro) return;

    ctx?.revert();
    ctx = undefined;

    isHeroExpanded.value = false;
    isIntroExpanded.value = false;

    await nextTick();
    await document.fonts.ready;

    if (id !== buildId) return;

    if (isMobile()) {
        showExpandedLayout();
        return;
    }

    const heroState = captureFlipState([
        hero.querySelector(".about-eyebrow"),
        hero.querySelector(".about-title"),
    ]);

    isHeroExpanded.value = true;

    await nextTick();

    if (id !== buildId) return;

    const introState = captureFlipState([
        intro.querySelector(".about-copy"),
        ...Array.from(
            intro.querySelectorAll(
                ".role-card, .role-card__title, .role-card__desc"
            )
        ),
    ]);

    isIntroExpanded.value = true;

    await nextTick();

    if (id !== buildId) return;

    const viewport = viewportRef.value;
    const track = trackRef.value;

    if (!viewport || !track) return;

    ctx = gsap.context(() => {
        const copy = intro.querySelector(".about-copy");

        const features = gsap.utils.toArray<HTMLElement>(
            intro.querySelectorAll(".role-card__features")
        );

        const caption = hero.querySelector(".about-caption");

        const exploreText = hero.querySelector(
            ".text-explore-course"
        );

        const courseCards = gsap.utils.toArray<HTMLElement>(
            track.querySelectorAll(".course-card")
        );

        const introTimeline = createPinnedTimeline(
            intro,
            INTRO_SCROLL_DISTANCE
        );

        introTimeline.to(
            copy,
            {
                autoAlpha: 0,
                y: -20,
                duration: 0.3,
            },
            0
        );

        introTimeline.add(
            createFlipTween(introState),
            0.1
        );

        introTimeline.fromTo(
            features,
            {
                autoAlpha: 0,
                y: 16,
            },
            {
                autoAlpha: 1,
                y: 0,
                stagger: 0.15,
                duration: 0.4,
                ease: "power2.out",
            },
            0.7
        );

        introTimeline.fromTo(
            caption,
            {
                autoAlpha: 0,
                y: 8,
            },
            {
                autoAlpha: 1,
                y: 0,
                duration: 0.3,
            },
            0.9
        );

        const horizontalDistance = Math.max(
            0,
            track.scrollWidth - viewport.clientWidth
        );

        const horizontalScrollDistance =
            horizontalDistance * HORIZONTAL_SCROLL_MULTIPLIER;

        const horizontalStart =
            HERO_TEXT_SCROLL_DISTANCE +
            EXPLORE_REVEAL_SCROLL_DISTANCE;

        const totalScrollDistance =
            horizontalStart +
            horizontalScrollDistance +
            HORIZONTAL_END_DELAY;

        const heroTimeline = createPinnedTimeline(
            hero,
            totalScrollDistance
        );

        heroTimeline.add(
            createFlipTween(
                heroState,
                HERO_TEXT_SCROLL_DISTANCE
            ),
            0
        );

        if (exploreText) {
            heroTimeline.fromTo(
                exploreText,
                {
                    autoAlpha: 0,
                    y: 24,
                },
                {
                    autoAlpha: 1,
                    y: 0,
                    duration: EXPLORE_REVEAL_SCROLL_DISTANCE,
                    ease: "power2.out",
                },
                HERO_TEXT_SCROLL_DISTANCE
            );
        }

        if (courseCards.length) {
            heroTimeline.fromTo(
                courseCards,
                {
                    autoAlpha: 0,
                    y: 24,
                },
                {
                    autoAlpha: 1,
                    y: 0,
                    duration: COURSE_CARDS_REVEAL_SCROLL_DISTANCE,
                    stagger: 0.1,
                    ease: "power2.out",
                },
                horizontalStart
            );
        }

        if (horizontalDistance > 0) {
            heroTimeline.to(
                track,
                {
                    x: -horizontalDistance,
                    duration: horizontalScrollDistance,
                    ease: "none",
                },
                horizontalStart
            );
        }

        heroTimeline.to(
            {},
            {
                duration: HORIZONTAL_END_DELAY,
            }
        );

    }, hero);

    ScrollTrigger.refresh();
}


function handleResize() {
    if (window.innerWidth === lastWidth) return;
    lastWidth = window.innerWidth;

    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildAnimation, RESIZE_DEBOUNCE_MS);
}

watch(
    () => courseStore.courses.length,
    () => {
        buildAnimation();
    }
);

onMounted(() => {
    lastWidth = window.innerWidth;
    buildAnimation();
    window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
    buildId++;
    window.removeEventListener("resize", handleResize);
    clearTimeout(resizeTimer);
    ctx?.revert();
});
</script>

<template>
    <section ref="introRef" id="about"
        class="about-intro relative mb-24 w-full px-6 py-16 text-text-primary sm:px-10 lg:px-[5%] lg:py-24">

        <header class="flex items-center justify-between gap-3 border-b border-text-primary pb-2">
            <a href="#about" class="text-lg font-semibold text-primary sm:text-[20px]">
                About Lingua.
            </a>

            <span class="text-[14px] font-semibold text-accent sm:text-[16px] lg:text-[20px]">
                Discover. Learn. Grow.
            </span>
        </header>

        <div class="relative mt-8 grid items-center gap-8 sm:mt-10 sm:gap-10 lg:mt-12 lg:gap-12"
            :class="isIntroExpanded ? introGridClass.expanded : introGridClass.collapsed">

            <div class="about-copy flex w-full max-w-152 flex-col gap-5 sm:gap-6 lg:gap-9"
                :class="isIntroExpanded ? introCopyClass.expanded : introCopyClass.collapsed">

                <p v-for="paragraph in introParagraphs" :key="paragraph"
                    class="m-0 text-[20px] font-bold leading-[1.3] sm:text-[26px] lg:text-[30px]">
                    {{ paragraph }}
                </p>

            </div>

            <div class="flex w-full flex-col gap-4">

                <article v-for="role in roles" :key="role.title"
                    class="role-card relative w-full overflow-hidden rounded-xl border" :class="[
                        role.cardClass,
                        isIntroExpanded ? cardClass.expanded : cardClass.collapsed,
                    ]">

                    <div class="min-w-0 flex-1">
                        <h3 class="role-card__title m-0 font-bold"
                            :class="isIntroExpanded ? cardTitleClass.expanded : cardTitleClass.collapsed">
                            {{ role.title }}
                        </h3>

                        <p class="role-card__desc m-0 max-w-75 leading-[1.3]"
                            :class="isIntroExpanded ? cardDescClass.expanded : cardDescClass.collapsed">
                            {{ role.description }}
                        </p>
                    </div>

                    <div class="role-card__features flex flex-col justify-between self-stretch text-[14px] font-semibold md:text-base"
                        :class="isIntroExpanded
                            ? [cardFeaturesClass.expanded, role.dividerClass]
                            : cardFeaturesClass.collapsed">
                        <span v-for="feature in role.features" :key="feature">
                            {{ feature }}
                        </span>
                    </div>

                </article>

            </div>
        </div>
    </section>

    <section ref="heroRef" class="relative w-full text-text-primary lg:h-[80vh]">

        <div class="mx-auto flex w-full flex-col py-6 lg:h-full lg:min-h-0">

            <div class="relative mb-8 h-px w-[90%] m-auto shrink-0 bg-text-primary lg:mb-auto">
                <span
                    class="about-caption absolute right-0 top-2 text-[14px] font-semibold text-primary sm:text-[16px] lg:top-auto lg:text-[20px]">
                    One Place. Two Possibilities.
                </span>
            </div>

            <div ref="viewportRef" class="relative min-h-0 w-full flex-1 overflow-visible lg:overflow-hidden">

                <div ref="trackRef"
                    class="grid h-auto w-full grid-cols-1 gap-4 px-6 sm:grid-cols-2 sm:px-10 lg:flex lg:h-full lg:min-h-0 lg:w-max lg:flex-row lg:items-center lg:px-0 lg:pr-32">

                    <div
                        class="col-span-full flex w-full flex-col gap-8 lg:col-auto lg:w-screen lg:flex-row lg:justify-around lg:gap-0">
                        <div
                            class="about-hero flex w-full shrink-0 flex-col justify-center gap-6 px-0 py-6 sm:py-10 lg:h-full lg:w-auto lg:gap-10 lg:px-2 lg:py-12">

                            <p class="about-eyebrow m-0 whitespace-normal font-bold leading-[1.12] tracking-[-0.02em] text-primary lg:whitespace-nowrap"
                                :class="isHeroExpanded ? heroEyebrowClass.expanded : heroEyebrowClass.collapsed">
                                Learn from others.<br />
                                Share what you know.
                            </p>

                            <h2 class="about-title m-0 whitespace-normal font-bold leading-[1.15] tracking-[-0.02em] text-accent lg:whitespace-nowrap"
                                :class="isHeroExpanded ? heroTitleClass.expanded : heroTitleClass.collapsed">
                                Learning Opportunities<br />
                                Should Be Easier to<br />
                                Discover.
                            </h2>

                        </div>

                        <h1
                            class="text-explore-course m-0 w-full shrink-0 text-[34px] font-bold leading-[1.05] text-text-primary sm:text-[46px] lg:w-md lg:self-center lg:text-[69px]">
                            Let's Explore Courses
                        </h1>
                    </div>

                    <article v-for="course in courseStore.courses" :key="course.id"
                        class="course-card group flex min-h-50 w-full shrink-0 flex-col justify-between rounded-2xl border border-gray-100 bg-surface p-5 shadow-sm transition-all duration-300 hover:border-primary-hover/30 hover:shadow-md lg:w-[min(82vw,420px)]">

                        <div>
                            <div class="mb-3 flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
                                <h3
                                    class="line-clamp-2 min-w-0 text-xl font-black text-dark-background transition-colors duration-200 group-hover:text-primary-hover sm:text-2xl">
                                    {{ course.name }}
                                </h3>

                                <div
                                    class="inline-flex max-w-full shrink-0 items-center gap-1.5 self-start rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary sm:max-w-[50%]">
                                    <MapPin :size="14" class="shrink-0" />
                                    <span class="line-clamp-2 wrap-break-word leading-tight">
                                        {{ course.address }}
                                    </span>
                                </div>
                            </div>

                            <p class="mb-6 line-clamp-3 text-[14px] font-normal leading-relaxed text-gray-600">
                                {{ course.description }}
                            </p>
                        </div>

                        <div class="flex items-center justify-between border-t border-gray-300 pt-4">
                            <button
                                class="cursor-pointer text-xs font-semibold text-gray-500 transition-colors hover:text-primary-hover"
                                @click="router.push({
                                    name: 'guest.course-detail',
                                    params: { id: course.id },
                                })">
                                See Details →
                            </button>
                        </div>

                    </article>

                    <button @click="router.push('/explore-courses')"
                        class="course-card group flex min-h-32 w-full shrink-0 rounded-2xl border border-gray-100 bg-secondary p-5 shadow-sm transition-all duration-300 hover:border-primary-hover/30 hover:shadow-md cursor-pointer sm:col-span-2 lg:col-auto lg:min-h-50 lg:w-auto">
                        <div class="flex w-full flex-col items-center justify-evenly gap-2">
                            <p
                                class="w-auto cursor-pointer text-center text-xl font-black text-surface transition-all duration-300 ease-in-out group-hover:text-accent lg:w-min">
                                Explore
                                More Courses</p>
                            <ChevronRight :size="50"
                                class="text-surface group-hover:text-accent transition-all duration-300 ease-in-out" />
                        </div>

                    </button>

                </div>


            </div>

        </div>
    </section>
</template>