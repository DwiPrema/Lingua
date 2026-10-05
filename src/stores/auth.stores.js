import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import * as authService from "@/service/auth_service"

export const useAuthStore = defineStore('auth', () => {
    const email = ref('')
    const fullname = ref('')
    const nickname = ref('')
    const phoneNumber = ref('')
    const role = ref('learner')

    const otp = ref('')
    const authIntent = ref(null)

    const loading = ref(false)
    const error = ref(null)

    const errors = ref({})

    const route = useRoute()
    const router = useRouter()

    const authMode = computed(() => route.name)

    function validateSignUpForm() {
        errors.value = {}

        if (!role.value) {
            errors.value.role = 'Please choose how you want to use Lingua.'
        }

        if (!email.value.trim()) {
            errors.value.email = 'Email is required.'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
            errors.value.email = 'Please enter a valid email address.'
        }

        if (!fullname.value.trim()) {
            errors.value.fullname = 'Full name is required.'
        }

        if (!phoneNumber.value.trim()) {
            errors.value.phoneNumber = 'Phone number is required.'
        } else if (!/^[0-9+\-\s()]+$/.test(phoneNumber.value)) {
            errors.value.phoneNumber = 'Please enter a valid phone number.'
        }

        return Object.keys(errors.value).length === 0
    }

    async function signUp(userEmail, userRole) {
        loading.value = true
        error.value = null

        try {
            email.value = userEmail
            role.value = userRole

            await authService.signUp(userEmail)
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    async function handleSignUp() {
        if (!validateSignUpForm()) {
            return
        }

        loading.value = true

        try {
            await authService.signUp(email.value)

            authIntent.value = 'signup'

            router.push('verify')
        } catch (error) {
            console.log(error)
            console.log(errors)
            errors.value.general = error.message
        } finally {
            loading.value = false
        }
    }

    return { email, fullname, nickname, phoneNumber, role, loading, error, errors, route, router, authMode, otp, authIntent, signUp, handleSignUp, validateSignUpForm }
})