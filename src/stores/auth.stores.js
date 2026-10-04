import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

export const useAuthStore = defineStore('auth', () => {
    const email = ref('')
    const fullname = ref('')
    const nickname = ref('')
    const phoneNumber = ref('')

    const role = ref('learner')

    const route = useRoute()
    const router = useRouter()

    const isLogin = computed(() => {
        return route.name === 'login'
    })

    return { email, fullname, nickname, phoneNumber, role, route, router, isLogin }
})