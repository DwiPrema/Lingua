<script setup>
import { useAuthStore } from '@/stores/auth_stores';
import { useHeaderStore } from '@/stores/header';
import { useUserDataStores } from '@/stores/user_data_stores';
import { Menu, X } from '@lucide/vue';
import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import CustomButton from './CustomButton.vue';

const store = useHeaderStore()
const userDataStore = useUserDataStores();
const authStore = useAuthStore();

const router = useRouter()

const { userData } = storeToRefs(userDataStore)

onMounted(async () => {
    await userDataStore.getUserData();
});
</script>

<template>
    <header class="relative z-50 px-6 py-7">
        <div class="w-full flex justify-between items-center">
            <!-- Logo -->
            <div class='text-text-primary text-[36px] font-extrabold cursor-pointer'>
                Lingua<span class="text-primary">.</span>
            </div>

            <!-- <ul class="md:flex hidden gap-8">
                <li v-for="menu in store.menuItems" :key="menu.name"><button @click="store.scrollToSection(menu.href)"
                        class="text-text-primary text-[16px] font-semibold hover:text-primary-hover transition-all duration-300 ease-in-out">{{
                            menu.name }}</button></li>
            </ul> -->

            <nav class="hidden md:flex items-center gap-10">

                <div class="flex flex-row items-center gap-2"
                    v-if="userData && userData.role == 'instructor' && authStore.currentUser != null">
                    <CustomButton @click="router.push('/dashboard')">Dashboard</CustomButton>
                </div>

                <div class="flex flex-row items-center gap-2" v-else>
                    <CustomButton @click="router.push('/auth/login')">Login</CustomButton>

                    <CustomButton @click="router.push('/auth/signup')">Sign Up</CustomButton>
                </div>
            </nav>

            <!-- menu button  -->
            <button class="md:hidden text-text-primary" @click="store.isMenuOpen = !store.isMenuOpen">
                <Menu v-if="!store.isMenuOpen" :size="32" />
                <X v-else :size="32" />
            </button>
        </div>

        <div v-if="store.isMenuOpen" class="fixed inset-0 bg-text-primary/60 backdrop-blur-sm md:hidden"
            @click="store.isMenuOpen = false">
            <div class="fixed top-0 right-0 h-full w-80 bg-light-background z-50 transform transition-transform duration-300 md:hidden p-4"
                @click="store.isMenuOpen ? 'translate-x-0' : 'translate-x-full'">
                <button class="self-end text-text-primary mb-10" @click="store.isMenuOpen = false">
                    <X :size="32" />
                </button>

                <ul class="flex flex-col gap-6">
                    <!-- <li v-for="menu in store.menuItems" :key="menu.name">
                        <button @click="store.scrollToSection(menu.href)" class="text-text-primary">{{ menu.name
                            }}</button>
                    </li> -->

                    <li>
                            <CustomButton @click="router.push('/auth/login')" block="true">Login</CustomButton>
                    </li>

                    <li>
                            <CustomButton @click="router.push('/auth/signup')" block="true">Sign Up</CustomButton>
                    </li>
                </ul>
            </div>
        </div>
    </header>
</template>