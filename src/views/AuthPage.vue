<script setup>
import LoadingDotsScale from '@/components/LoadingDotsScale.vue';
import { useAuthStore } from '@/stores/auth_stores';
import { ref } from 'vue';


const authStore = useAuthStore()

</script>

<template>
    <main class="min-h-screen bg-black p-6 flex items-center justify-center">
        <div
            class="mx-auto flex min-h-[80vh] max-w-6xl min-w-[80%] overflow-hidden rounded-3xl bg-light-text shadow-xl">

            <section
                class="relative hidden w-1/2 overflow-hidden bg-primary p-12 lg:flex lg:flex-col lg:justify-between">

                <div class="flex flex-col items-start gap-4">
                    <h1 class='text-light-text text-3xl font-black cursor-pointer text-left'>
                        Lingua.
                    </h1>

                    <p class="mb-4 text-sm font-medium uppercase tracking-widest text-light-text text-left">
                        Learn & Create
                    </p>
                </div>

                <div class="relative z-10 max-w-md">

                    <h2 class="text-5xl font-black leading-tight text-dark-background">
                        Learn today,
                        <br />
                        create tomorrow.
                    </h2>

                    <p class="mt-6 max-w-sm text-dark-background/80">
                        Learn new languages, join courses,
                        share your knowledge, and grow together
                        with the Lingua community.
                    </p>
                </div>

            </section>

            <section class="flex w-full flex-col justify-center px-6 py-10 sm:px-12 lg:w-1/2 lg:px-16">

                <div class="mx-auto w-full max-w-md">

                    <div class="mb-10 lg:hidden">
                        <h1 class='text-accent text-3xl font-black cursor-pointer'>
                            Lingua.
                        </h1>
                    </div>


                    <!-- ========================= -->
                    <!-- VERIFY -->
                    <!-- ========================= -->

                    <template v-if="authStore.authMode === 'auth-verify'">

                        <div class="mb-8">
                            <h2 class="text-3xl font-bold text-dark-background">
                                Verify your email
                            </h2>

                            <p class="mt-2 leading-relaxed text-gray-500">
                                We've sent a 6-digit verification code to
                                <span class="font-medium text-dark-background">
                                    {{ authStore.email }}
                                </span>
                            </p>
                        </div>


                        <form class="space-y-6" @submit.prevent="authStore.handleVerify">

                            <!-- OTP INPUT -->

                            <div>
                                <label for="otp" class="mb-2 block text-sm font-medium text-gray-700">
                                    Verification code
                                </label>

                                <input id="otp" v-model="authStore.otp" type="text" inputmode="numeric"
                                    autocomplete="one-time-code" maxlength="6" placeholder="000000"
                                    class="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-center text-2xl font-semibold tracking-[0.5em] outline-none transition focus:border-dark-background focus:bg-white focus:ring-2 focus:ring-dark-background/10" />
                            </div>


                            <!-- VERIFY BUTTON -->

                            <button type="submit"
                                class="w-full rounded-xl bg-dark-background px-4 py-3.5 font-medium text-white transition hover:bg-gray-800 active:scale-[0.99]">
                                Verify email
                            </button>

                        </form>


                        <!-- RESEND -->

                        <div class="mt-6 text-center">

                            <p class="text-sm text-gray-500">
                                Didn't receive the code?
                            </p>

                            <button type="button" class="mt-1 font-semibold text-dark-background hover:underline"
                                @click="authStore.resendOtp()">
                                Resend code
                            </button>

                        </div>


                        <!-- CHANGE EMAIL -->

                        <div class="mt-8 text-center">

                            <button type="button" class="text-sm text-gray-500 hover:text-dark-background"
                                @click="authStore.router.push('signup')">
                                ← Change email
                            </button>

                        </div>

                    </template>

                    <!-- ========================= -->
                    <!-- LOGIN -->
                    <!-- ========================= -->

                    <template v-if="authStore.authMode === 'auth-login'">
                        <div class="mb-8">
                            <h2 class="text-3xl font-bold text-dark-background">
                                Welcome back
                            </h2>

                            <p class="mt-2 text-gray-500">
                                Log in to continue learning with Lingua.
                            </p>
                        </div>

                        <!-- Login method selector -->
                        <div class="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1">
                            <button type="button" @click="authStore.loginMethod = 'password'" :class="authStore.loginMethod === 'password'
                                ? 'bg-white text-dark-background shadow-sm'
                                : 'text-gray-500 hover:text-dark-background'"
                                class="rounded-lg px-3 py-2.5 text-sm font-semibold transition">
                                Password
                            </button>

                            <button type="button" @click="authStore.loginMethod = 'otp'" :class="authStore.loginMethod === 'otp'
                                ? 'bg-white text-dark-background shadow-sm'
                                : 'text-gray-500 hover:text-dark-background'"
                                class="rounded-lg px-3 py-2.5 text-sm font-semibold transition">
                                Email OTP
                            </button>
                        </div>

                        <!-- Error message -->
                        <div v-if="authStore.error" ref="signupErrorRef"
                            class="mb-5 rounded-xl border border-alert/50 bg-alert/10 p-3">
                            <p class="text-sm text-alert">
                                {{ authStore.error }}
                            </p>
                        </div>

                        <form v-if="authStore.loginMethod === 'password'" class="space-y-5"
                            @submit.prevent="authStore.handlePasswordSignIn">
                            <div>
                                <label for="login-email" class="mb-2 block text-sm font-medium text-gray-700">
                                    Email address
                                </label>

                                <input id="login-email" v-model.trim="authStore.email" type="email" autocomplete="email"
                                    required placeholder="you@example.com"
                                    class="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none transition focus:border-dark-background focus:bg-white focus:ring-2 focus:ring-dark-background/10" />
                            </div>

                            <div>
                                <label for="login-password" class="mb-2 block text-sm font-medium text-gray-700">
                                    Password
                                </label>

                                <input id="login-password" v-model="authStore.password" type="password"
                                    autocomplete="current-password" required placeholder="Enter your password"
                                    class="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none transition focus:border-dark-background focus:bg-white focus:ring-2 focus:ring-dark-background/10" />
                            </div>

                            <button type="submit" :disabled="authStore.loading"
                                class="flex w-full items-center justify-center rounded-xl bg-dark-background px-4 py-3.5 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60">
                                {{ authStore.loading ? 'Signing in...' : 'Sign in with password' }}
                            </button>
                        </form>

                        <form v-else class="space-y-5" @submit.prevent="authStore.handleOtpSignIn">
                            <div>
                                <label for="otp-login-email" class="mb-2 block text-sm font-medium text-gray-700">
                                    Email address
                                </label>

                                <input id="otp-login-email" v-model.trim="authStore.email" type="email"
                                    autocomplete="email" required placeholder="you@example.com"
                                    class="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none transition focus:border-dark-background focus:bg-white focus:ring-2 focus:ring-dark-background/10" />
                            </div>

                            <p class="text-sm leading-relaxed text-gray-500">
                                We'll send a one-time verification code to your email.
                            </p>

                            <button type="submit" :disabled="authStore.loading"
                                class="flex w-full items-center justify-center rounded-xl bg-dark-background px-4 py-3.5 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60">
                                {{ authStore.loading ? 'Sending code...' : 'Send login code' }}
                            </button>
                        </form>

                        <p class="mt-8 text-center text-sm text-gray-500">
                            Don't have an account?

                            <button type="button" class="ml-1 font-semibold text-dark-background hover:underline"
                                @click="authStore.router.push({ name: 'auth-signup' })">
                                Sign up
                            </button>
                        </p>
                    </template>



                    <!-- ========================= -->
                    <!-- SIGN UP -->
                    <!-- ========================= -->

                    <template v-if="authStore.authMode === 'auth-signup'">

                        <div class="mb-8">
                            <h2 class="text-3xl font-black text-dark-background">
                                Create your account
                            </h2>

                            <p class="mt-2 text-gray-500">
                                Choose how you want to use Lingua.
                            </p>
                        </div>

                        <div v-if="authStore.error" class="mb-6 rounded-xl border border-alert/50 bg-alert/20 p-4">
                            <p class="text-sm text-alert">
                                {{ authStore.error }}
                            </p>
                        </div>

                        <form class="space-y-6" @submit.prevent="authStore.handleSignUp">

                            <div>
                                <label class="mb-3 block text-sm font-medium text-gray-700">
                                    I want to...
                                </label>

                                <div class="grid grid-cols-2 gap-3">

                                    <button type="button" class="rounded-2xl border p-4 text-left transition" :class="authStore.role === 'student'
                                        ? 'border-dark-background bg-gray-50 ring-1 ring-accent'
                                        : 'border-gray-200 hover:border-gray-400'
                                        " @click="authStore.role = 'student'">

                                        <div class="mb-3 flex items-center justify-between">

                                            <div class="flex flex-row gap-2 items-center">
                                                <div
                                                    class="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/30">
                                                    🎓
                                                </div>
                                                <p class="font-semibold text-dark-background">
                                                    Learn
                                                </p>
                                            </div>

                                            <div class="h-4 w-4 rounded-full border" :class="authStore.role === 'student'
                                                ? 'border-accent bg-accent'
                                                : 'border-gray-300'
                                                "></div>

                                        </div>

                                        <p class="mt-1 text-xs leading-relaxed text-gray-500">
                                            Join courses and improve your skills.
                                        </p>

                                    </button>

                                    <button type="button" class="rounded-2xl border p-4 text-left transition" :class="authStore.role === 'instructor'
                                        ? 'border-dark-background bg-gray-50 ring-1 ring-accent'
                                        : 'border-gray-200 hover:border-gray-400'
                                        " @click="authStore.role = 'instructor'">

                                        <div class="mb-3 flex items-center justify-between">

                                            <div class="flex flex-row gap-2 items-center">
                                                <div
                                                    class="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/30">
                                                    ✨
                                                </div>

                                                <p class="font-semibold text-dark-background">
                                                    Create
                                                </p>
                                            </div>

                                            <div class="h-4 w-4 rounded-full border" :class="authStore.role === 'instructor'
                                                ? 'border-accent bg-accent'
                                                : 'border-gray-300'
                                                "></div>

                                        </div>

                                        <p class="mt-1 text-xs leading-relaxed text-gray-500">
                                            Create courses and share your knowledge.
                                        </p>

                                    </button>

                                </div>
                            </div>

                            <div>

                                <label for="signup-email" class="mb-2 block text-sm font-medium text-gray-700">
                                    Email address
                                </label>

                                <input id="signup-email" v-model="authStore.email" type="email"
                                    placeholder="you@example.com"
                                    class="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none transition focus:border-dark-background focus:bg-white focus:ring-2 focus:ring-dark-background/10" />

                                <p v-if="authStore.errors.email" class="mt-1 text-sm text-alert">
                                    {{ authStore.errors.email }}
                                </p>

                            </div>

                            <div>

                                <label for="password" class="mb-2 block text-sm font-medium text-gray-700">
                                    Password
                                </label>

                                <input id="password" v-model="authStore.password" type="password"
                                    placeholder="Enter your password!"
                                    class="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none transition focus:border-dark-background focus:bg-white focus:ring-2 focus:ring-dark-background/10" />

                                <p v-if="authStore.errors.password" class="mt-1 text-sm text-alert">
                                    {{ authStore.errors.password }}
                                </p>

                            </div>

                            <div>

                                <label for="fullname" class="mb-2 block text-sm font-medium text-gray-700">
                                    Full Name
                                </label>

                                <input id="fullname" v-model="authStore.fullname" type="text"
                                    placeholder="Enter your fullname here!"
                                    class="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none transition focus:border-dark-background focus:bg-white focus:ring-2 focus:ring-dark-background/10" />

                                <p v-if="authStore.errors.fullname" class="mt-1 text-sm text-alert">
                                    {{ authStore.errors.fullname }}
                                </p>

                            </div>

                            <div>

                                <label for="nickname" class="mb-2 block text-sm font-medium text-gray-700">
                                    Nick Name
                                </label>

                                <input id="nickname" v-model="authStore.nickname" type="text"
                                    placeholder="Enter your nickname here!"
                                    class="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none transition focus:border-dark-background focus:bg-white focus:ring-2 focus:ring-dark-background/10" />

                            </div>

                            <div>

                                <label for="phone-number" class="mb-2 block text-sm font-medium text-gray-700">
                                    Phone Number
                                </label>

                                <input id="phone-number" v-model="authStore.phoneNumber" type="text" inputmode="numeric"
                                    placeholder="Enter your phone number please!"
                                    class="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none transition focus:border-dark-background focus:bg-white focus:ring-2 focus:ring-dark-background/10" />

                                <p v-if="authStore.errors.phoneNumber" class="mt-1 text-sm text-alert">
                                    {{ authStore.errors.phoneNumber }}
                                </p>
                            </div>

                            <div v-if="authStore.loading"
                                class="flex items-center justify-center w-full rounded-xl bg-dark-background px-4  font-medium text-white transition hover:bg-gray-800 active:scale-[0.99]">
                                <LoadingDotsScale color="var(--color-light-text)" size="42" />
                            </div>

                            <button type="submit" v-else
                                class="w-full rounded-xl bg-dark-background px-4 py-2 font-medium text-white transition hover:bg-gray-800 active:scale-[0.99]">
                                Continue with email
                            </button>

                        </form>

                        <p class="mt-8 text-center text-sm text-gray-500">
                            Already have an account?

                            <button type="button" class="ml-1 font-semibold text-dark-background hover:underline"
                                @click="authStore.router.push('login')">
                                Log in
                            </button>
                        </p>

                    </template>

                    <p class="mt-8 text-center text-xs leading-relaxed text-gray-400">
                        By continuing, you agree to Lingua's
                        <a href="#" class="underline hover:text-gray-600">
                            Terms of Service
                        </a>
                        and
                        <a href="#" class="underline hover:text-gray-600">
                            Privacy Policy
                        </a>.
                    </p>

                </div>

            </section>

        </div>
    </main>
</template>