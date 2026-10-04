<script setup>
import { useHeaderStore } from '@/stores/header';
import { Menu, X } from '@lucide/vue';

const store = useHeaderStore()
</script>

<template>
    <header class="relative z-50 px-6 py-7">
        <div class="w-full flex justify-between items-center">
            <!-- Logo -->
            <div class='text-light-text text-3xl font-black cursor-pointer'>
                Lingua<span class="text-primary">.</span>
            </div>

            <nav class="hidden md:flex items-center gap-10">
                <ul class="flex gap-8">
                    <li v-for="menu in store.menuItems" :key="menu.name"><button
                            @click="store.scrollToSection(menu.href)"
                            class="text-gray-300 hover:text-light-text transition-all duration-300 ease-in-out">{{
                                menu.name }}</button></li>
                </ul>

                <div class="flex flex-row items-center gap-2">
                    <a href="/login"
                        class="text-light-text text-nowrap text-center bg-primary p-2 min-w-25 rounded-lg cursor-pointer hover:bg-success duration-300 transition-all ease-in-out">Login</a>

                    <a href="/signup"
                        class="text-light-text text-nowrap text-center bg-primary p-2 min-w-25 rounded-lg cursor-pointer hover:bg-success duration-300 transition-all ease-in-out">Sign
                        Up</a>
                </div>
            </nav>

            <!-- menu button  -->
            <button class="md:hidden text-light-text" @click="store.isMenuOpen = !store.isMenuOpen">
                <Menu v-if="!store.isMenuOpen" :size="32" />
                <X v-else :size="32" />
            </button>
        </div>

        <div v-if="store.isMenuOpen" class="fixed inset-0 bg-black/60 backdrop-blur-sm md:hidden"
            @click="store.isMenuOpen = false">
            <div class="fixed top-0 right-0 h-full w-80 bg-[#111827] z-50 transform transition-transform duration-300 md:hidden p-4"
                @click="store.isMenuOpen ? 'translate-x-0' : 'translate-x-full'">
                <button class="self-end text-light-text mb-10" @click="store.isMenuOpen = false">
                    <X :size="32" />
                </button>

                <ul class="flex flex-col gap-6">
                    <li v-for="menu in store.menuItems" :key="menu.name">
                        <button @click="store.scrollToSection(menu.href)" class="text-light-text">{{ menu.name
                        }}</button>
                    </li>

                    <li>
                        <button
                            class="text-light-text text-nowrap bg-primary p-2 w-full rounded-lg cursor-pointer hover:bg-success duration-300 transition-all ease-in-out">Login</button>
                    </li>

                    <li>
                        <button
                            class="text-light-text text-nowrap bg-primary p-2 w-full rounded-lg cursor-pointer hover:bg-success duration-300 transition-all ease-in-out">Sign
                            Up</button>
                    </li>
                </ul>
            </div>
        </div>
    </header>
</template>