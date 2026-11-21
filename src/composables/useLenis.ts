import { onMounted, onBeforeUnmount } from "vue";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useLenis() {
    let lenis: Lenis | null = null;

    const updateScroll = () => ScrollTrigger.update();

    const raf = (time: number) => {
        lenis?.raf(time * 1000);
    };

    onMounted(() => {
        lenis = new Lenis({
            duration: 1.4,
            easing: (t) => 1 - Math.pow(1 - t, 4),
            smoothWheel: true,
            wheelMultiplier: 0.85,
            touchMultiplier: 1,
        });

        lenis.on("scroll", updateScroll);

        gsap.ticker.add(raf);
        gsap.ticker.lagSmoothing(0);
    });

    onBeforeUnmount(() => {
        gsap.ticker.remove(raf);

        lenis?.off("scroll", updateScroll);
        lenis?.destroy();

        lenis = null;
    });
}