<script setup>
import {
    computed,
    onMounted,
    onBeforeUnmount,
    ref,
    watch,
} from 'vue'

import { useUserDataStores } from '@/stores/user_data_stores'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth_stores.js'

const userStore = useUserDataStores()

const router = useRouter()

// Reactive data from Pinia
const user = computed(() => userStore.userData)
const loading = computed(() => userStore.loading)
const error = computed(() => userStore.error ?? '')

// Update functionality will be implemented later.
const saving = ref(false)

const isEditing = ref(false)
const avatarPreview = ref('')
const avatarInput = ref(null)

const form = ref({
    fullname: '',
    nickname: '',
    phone: '',
})

const original = ref({ ...form.value })

function syncUser(userData) {
    form.value = {
        fullname: userData?.fullname ?? '',
        nickname: userData?.nickname ?? '',
        phone: userData?.phone ?? '',
    }

    original.value = { ...form.value }
}

// Sync the form when the store fetches the database record.
watch(
    user,
    (userData) => {
        if (userData) {
            syncUser(userData)
        }
    },
    { immediate: true },
)

// Fetch the current user's data when this page is mounted.
onMounted(async () => {
    if (!user.value) {
        await userStore.getUserData()
    }
})

const initials = computed(() => {
    const name = form.value.fullname.trim()

    return (
        name
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0].toUpperCase())
            .join('') || 'U'
    )
})

function startEditing() {
    original.value = { ...form.value }
    isEditing.value = true
}

function cancelEditing() {
    form.value = { ...original.value }
    isEditing.value = false
}


async function saveEditing() {
    const payload = {
        fullname: form.value.fullname.trim(),
        nickname: form.value.nickname.trim(),
        phone: form.value.phone.trim(),
    }

    if (!payload.fullname || !payload.phone) {
        return
    }

    try {
        const updatedUser = await userStore.updateUserData(payload)

        syncUser(updatedUser)

        isEditing.value = false

        console.info('Profile updated successfully.')
    } catch (err) {
        console.error('Failed to update profile:', err)
    }
}


function handleAvatarChange(event) {
    const file = event.target.files?.[0]

    if (!file || !file.type.startsWith('image/')) {
        event.target.value = ''
        return
    }

    if (avatarPreview.value) {
        URL.revokeObjectURL(avatarPreview.value)
    }

    avatarPreview.value = URL.createObjectURL(file)

    // Preview only; no upload to Supabase yet.
    event.target.value = ''
}

function retry() {
    return userStore.getUserData()
}

onBeforeUnmount(() => {
    if (avatarPreview.value) {
        URL.revokeObjectURL(avatarPreview.value)
    }
})

const authStore = useAuthStore()

const showLogoutModal = ref(false)
const loggingOut = ref(false)

function handleLogout() {
    showLogoutModal.value = true
}

function cancelLogout() {
    if (loggingOut.value) return
    showLogoutModal.value = false
}

async function confirmLogout() {
    if (loggingOut.value) return

    loggingOut.value = true

    try {
        await authStore.signOut()
        // Your existing signOut() redirects to the login page.
    } catch (err) {
        console.error('Failed to log out:', err)
    } finally {
        loggingOut.value = false
    }
}

</script>


<template>
        <!-- Logout confirmation modal -->
    <Teleport to="body">
        <div
            v-if="showLogoutModal"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
            @click.self="cancelLogout"
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="logout-title"
                class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:p-8"
            >
                <div class="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                    <span class="text-2xl" aria-hidden="true">↪</span>
                </div>

                <h2
                    id="logout-title"
                    class="text-xl font-bold text-gray-900"
                >
                    Log out of Lingua?
                </h2>

                <p class="mt-2 text-sm leading-6 text-gray-500">
                    Are you sure you want to log out of your account?
                    You will need to sign in again to access your dashboard.
                </p>

                <div class="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        :disabled="loggingOut"
                        class="rounded-xl border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        @click="cancelLogout"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        :disabled="loggingOut"
                        class="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        @click="confirmLogout"
                    >
                        {{ loggingOut ? 'Logging out...' : 'Yes, log out' }}
                    </button>
                </div>
            </section>
        </div>
    </Teleport>

    <main class="min-h-screen bg-gray-50 py-8">
        <div class="mx-auto">
            <!-- Page heading -->
            <header class="mb-8 flex items-center justify-between gap-4">
                <div>
                    <button type="button" class="mb-5 text-sm font-medium text-slate-500 hover:text-primary"
                        @click="router.push('/')">
                        &larr; Back
                    </button>
                    <h1 class="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
                        My Profile
                    </h1>
                    <p class="mt-2 text-sm text-gray-500">
                        Manage your personal information and account.
                    </p>
                </div>

                <button class="inline-flex items-center gap-2 rounded-lg
                 border border-red-200 px-3 py-2 text-sm
                 font-medium text-alert transition
                 hover:bg-red-50" @click="handleLogout">
                    <span aria-hidden="true">↪</span>
                    <span class="hidden sm:inline">Log out</span>
                </button>
            </header>

            <!-- Loading state -->
            <div v-if="loading" class="rounded-2xl border border-gray-200 bg-white p-10
               text-center text-sm text-gray-500" role="status">
                Loading your profile...
            </div>

            <!-- Error state -->
            <div v-else-if="error" class="rounded-2xl border border-red-200 bg-white p-6" role="alert">
                <p class="font-medium text-alert">
                    Unable to load your profile
                </p>
                <p class="mt-2 text-sm text-gray-600">
                    {{ error }}
                </p>
                <button type="button" class="mt-4 rounded-lg bg-alert px-4 py-2
                 text-sm font-medium text-white hover:bg-red-900" @click="emit('retry')">
                    Try again
                </button>
            </div>

            <div v-else class="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <!-- Profile summary -->
                <section class="h-fit rounded-2xl border border-gray-200
                 bg-white p-6 shadow-sm">
                    <h2 class="text-lg font-semibold text-gray-900">
                        Profile overview
                    </h2>

                    <div class="mt-6 flex flex-col items-center text-center">
                        <div class="relative">
                            <img v-if="avatarPreview || user?.avatar_url" :src="avatarPreview || user.avatar_url"
                                alt="Profile photo" class="h-28 w-28 rounded-full border-4
                       border-white object-cover shadow-md" />

                            <div v-else class="flex h-28 w-28 items-center justify-center
                       rounded-full bg-accent/20 text-3xl font-bold
                       text-accent" aria-label="Profile initials">
                                {{ initials }}
                            </div>

                            <button type="button" aria-label="Change profile photo" title="Change profile photo" class="absolute bottom-0 right-0 flex h-9 w-9
                       items-center justify-center rounded-full
                       border-4 border-white bg-accent/80 duration-300 ease-in-out
                       text-white transition hover:bg-accent" @click="avatarInput?.click()">
                                <span aria-hidden="true">✎</span>
                            </button>

                            <input ref="avatarInput" type="file" accept="image/*" class="hidden"
                                @change="handleAvatarChange" />
                        </div>

                        <h3 class="mt-4 text-xl font-semibold text-gray-900">
                            {{ form.fullname || 'Your name' }}
                        </h3>

                        <p class="mt-1 text-sm text-gray-500">
                            {{ user?.email || 'No email available' }}
                        </p>

                        <span class="mt-4 rounded-full bg-red-50 px-3 py-1
                     text-xs font-medium capitalize text-accent">
                            {{ user?.role || 'Member' }}
                        </span>
                    </div>

                    <div class="mt-6 border-t border-gray-100 pt-5">
                        <p class="text-xs leading-5 text-gray-500">
                            Keep your contact information up to date so your
                            account details remain accurate.
                        </p>
                    </div>
                </section>

                <!-- Profile form -->
                <section class="rounded-2xl border border-gray-200 bg-white
                 p-6 shadow-sm sm:p-8 lg:col-span-2">
                    <div class="flex flex-col justify-between gap-3 sm:flex-row
                   sm:items-center">
                        <div>
                            <h2 class="text-lg font-semibold text-gray-900">
                                Personal information
                            </h2>
                            <p class="mt-1 text-sm text-gray-500">
                                Your basic account details.
                            </p>
                        </div>

                        <button v-if="!isEditing" type="button" class="self-start rounded-lg border border-gray-300
                     px-4 py-2 text-sm font-medium text-gray-700
                     transition hover:bg-gray-50 sm:self-auto" @click="startEditing">
                            Edit profile
                        </button>
                    </div>

                    <form class="mt-8 space-y-6" @submit.prevent="saveEditing">
                        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div class="sm:col-span-2">
                                <label for="fullname" class="mb-2 block text-sm font-medium text-gray-700">
                                    Full name
                                </label>
                                <input id="fullname" v-model="form.fullname" type="text" autocomplete="name" required
                                    :readonly="!isEditing" class="w-full rounded-xl border px-4 py-3
                         text-sm text-gray-900 outline-none transition
                         focus:border-accent focus:ring-2
                         focus:ring-red-100 read-only:bg-gray-50
                         read-only:text-gray-600" />
                            </div>

                            <div>
                                <label for="nickname" class="mb-2 block text-sm font-medium text-gray-700">
                                    Nickname
                                </label>
                                <input id="nickname" v-model="form.nickname" type="text" autocomplete="nickname"
                                    :readonly="!isEditing" class="w-full rounded-xl border px-4 py-3
                         text-sm text-gray-900 outline-none transition
                         focus:border-accent focus:ring-2
                         focus:ring-red-100 read-only:bg-gray-50
                         read-only:text-gray-600" />
                            </div>

                            <div>
                                <label for="phone" class="mb-2 block text-sm font-medium text-gray-700">
                                    Phone number
                                </label>
                                <input id="phone" v-model="form.phone" type="tel" autocomplete="tel" required
                                    :readonly="!isEditing" class="w-full rounded-xl border px-4 py-3
                         text-sm text-gray-900 outline-none transition
                         focus:border-accent focus:ring-2
                         focus:ring-red-100 read-only:bg-gray-50
                         read-only:text-gray-600" />
                            </div>

                            <div class="sm:col-span-2">
                                <label for="email" class="mb-2 block text-sm font-medium text-gray-700">
                                    Email address
                                </label>
                                <input id="email" :value="user?.email || ''" type="email" readonly class="w-full cursor-not-allowed rounded-xl
                         border bg-gray-50 px-4 py-3 text-sm
                         text-gray-500" />
                                <p class="mt-2 text-xs text-gray-500">
                                    Your email is managed by your authentication account.
                                </p>
                            </div>
                        </div>

                        <div v-if="isEditing" class="flex flex-col-reverse gap-3 border-t
                     border-gray-100 pt-6 sm:flex-row sm:justify-end">
                            <button type="button" :disabled="saving" class="rounded-xl border border-gray-300 px-5 py-3
                       text-sm font-medium text-gray-700
                       hover:bg-gray-50 disabled:opacity-50" @click="cancelEditing">
                                Cancel
                            </button>

                            <button type="submit" :disabled="saving || !form.fullname.trim() || !form.phone.trim()"
                                class="rounded-xl bg-accent px-5 py-3
                       text-sm font-semibold text-white
                       transition hover:bg-red-900
                       disabled:cursor-not-allowed disabled:opacity-50">
                                {{ saving ? 'Saving...' : 'Save changes' }}
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </div>
    </main>
</template>