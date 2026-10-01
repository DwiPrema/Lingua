import { defineStore } from "pinia";
import { ref } from "vue";

export const useHeaderStore = defineStore('header', () => {
    const menuItems = [
        { name: 'About', href: '#about' },
        { name: 'Explore', href: '#explore' },
        { name: 'How it works', href: '#howItWorks' }
    ]

    const isMenuOpen = ref(false)

    function scrollToSection(href) {
        isMenuOpen.value = false

        const element = document.querySelector(href)

        if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
        }
    }

    return { isMenuOpen, scrollToSection, menuItems }
})