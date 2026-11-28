<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { useOrganizationStore } from '@/stores/organization_stores'
import { supabase } from '@/lib/supabase'
import type { OrganizationSetupInput } from '@/service/organization_service'
import '@/assets/grid.css'
import CustomButton from '@/components/CustomButton.vue'
import { useUserDataStores } from '@/stores/user_data_stores'
import { useAuthStore } from '@/stores/auth_stores'

const router = useRouter()
const organizationStore = useOrganizationStore()

type FormErrors = Partial<Record<keyof OrganizationSetupInput, string>>

const form = reactive<OrganizationSetupInput>({
  name: '',
  bank_name: '',
  account_number: '',
  account_name: '',
  qris_url: '',
  payment_notes: '',
})

const errors = reactive<FormErrors>({})

const joinModalOpen = ref(false)
const organizationId = ref('')
const joinError = ref('')

const userLoading = ref(true)
const currentUserId = ref('')

const userDataStore = useUserDataStores()
const authStore = useAuthStore()

function clearValidationErrors() {
  Object.keys(errors).forEach((key) => {
    delete errors[key as keyof FormErrors]
  })
}

function clearFormErrors() {
  clearValidationErrors()
  organizationStore.clearError()
}

async function getCurrentUser(): Promise<void> {
  userLoading.value = true
  organizationStore.clearError()

  try {
    const { data, error } = await supabase.auth.getUser()

    if (error) throw error

    if (!data.user) {
      throw new Error('Silakan login terlebih dahulu.')
    }

    currentUserId.value = data.user.id
  } catch (error) {
    console.error('Failed to get current user:', error)

    organizationStore.error =
      error instanceof Error
        ? error.message
        : 'Gagal mengambil informasi pengguna.'
  } finally {
    userLoading.value = false
  }
}

function validateForm(): boolean {
  clearValidationErrors()

  if (!form.name.trim()) {
    errors.name = 'Nama organisasi wajib diisi.'
  }

  if (!form.bank_name.trim()) {
    errors.bank_name = 'Nama bank wajib diisi.'
  }

  if (!form.account_number.trim()) {
    errors.account_number = 'Nomor rekening wajib diisi.'
  } else if (!/^[0-9 -]+$/.test(form.account_number.trim())) {
    errors.account_number = 'Nomor rekening tidak valid.'
  }

  if (!form.account_name.trim()) {
    errors.account_name = 'Nama pemilik rekening wajib diisi.'
  }

  if (form.qris_url?.trim()) {
    try {
      const url = new URL(form.qris_url.trim())

      if (!['http:', 'https:'].includes(url.protocol)) {
        errors.qris_url = 'URL QRIS tidak valid.'
      }
    } catch {
      errors.qris_url = 'Masukkan URL QRIS yang valid.'
    }
  }

  return Object.keys(errors).length === 0
}

async function handleSubmit(): Promise<void> {
  if (organizationStore.isLoading || userLoading.value) return

  clearFormErrors()

  if (!currentUserId.value) {
    organizationStore.error =
      'Session login tidak ditemukan. Silakan login kembali.'
    return
  }

  if (!validateForm()) return

  try {
    await organizationStore.completeSetup({
      name: form.name.trim(),
      bank_name: form.bank_name.trim(),
      account_number: form.account_number.trim(),
      account_name: form.account_name.trim(),
      qris_url: form.qris_url?.trim() || null,
      payment_notes: form.payment_notes?.trim() || null,
    })

    await userDataStore.getUserData()

    if (userDataStore.userData?.role !== 'instructor') {
      throw new Error(
        'Organisasi berhasil disimpan, tetapi role instructor belum diperbarui.'
      )
    }

    sessionStorage.removeItem('registrationIntent')

    await router.replace({ name: 'dashboard' })

  } catch (error) {
    console.error('Failed to complete organization setup:', error)

    organizationStore.error =
      error instanceof Error
        ? error.message
        : 'Gagal menyimpan organisasi.'
  }
}

async function handleJoin(): Promise<void> {
  joinError.value = ''

  if (organizationStore.isLoading) return

  if (!organizationId.value.trim()) {
    joinError.value = 'Masukkan ID organisasi.'
    return
  }

  try {
    const { data, error } = await supabase.auth.getUser()

    if (error) throw error

    if (!data.user) {
      throw new Error('Session login tidak ditemukan.')
    }

    await organizationStore.joinOrganization(
      organizationId.value.trim()
    )

    closeJoinModal()

    sessionStorage.removeItem('registrationIntent')

    await router.replace({ name: 'dashboard' })
  } catch (error) {
    console.error('Failed to join organization:', error)

    joinError.value =
      error instanceof Error
        ? error.message
        : 'Gagal bergabung dengan organisasi.'
  }
}

function closeJoinModal(): void {
  joinModalOpen.value = false
  joinError.value = ''
  organizationId.value = ''
}

onMounted(() => {
  void getCurrentUser()
})
</script>

<template>
  <div class="min-h-screen hero-grid text-text-primary">
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex h-16 items-center justify-between px-5">
        <RouterLink to="/" class="text-[30px] font-black tracking-tight">
          Lingua<span class="text-primary">.</span>
        </RouterLink>

        <span class="text-[14px] text-text-secondary">
          Instructor onboarding
        </span>
      </div>
    </header>

    <main class="mx-auto px-4 py-10 sm:px-6">
      <div class="mb-8">
        <span class="text-[12px] font-semibold uppercase tracking-widest text-primary">
          Organization setup
        </span>

        <h1 class="mt-3 text-[36px] font-black tracking-tight">
          Setup Organisasi
        </h1>

        <p class="mt-1 text-[14px] leading-6 text-text-secondary">
          Lengkapi profil organisasi dan informasi pembayaran sebelum
          mulai mengelola course di Lingua.
        </p>
      </div>

      <section class="mb-6 rounded-2xl border border-text-primary bg-accent p-5 sm:p-6">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="font-bold text-[18px]">
              Sudah memiliki organisasi?
            </h2>

            <p class="mt-1 text-[14px] text-text-primary">
              Bergabung menggunakan ID dari owner organisasi.
            </p>
          </div>

          <CustomButton @click="joinModalOpen = true" variant="outline"
            class="text-text-primary border border-text-primary cursor-pointer transition-all duration-300 ease-in-out">
            Join Organization <span aria-hidden="true">→</span>
          </CustomButton>
        </div>
      </section>

      <form class="overflow-hidden rounded-2xl border border-text-primary bg-surface" @submit.prevent="handleSubmit">
        <div class="border-b border-slate-100 px-5 py-5 sm:px-7">
          <h2 class="font-bold text-[18px]">
            Informasi Organisasi
          </h2>

          <p class="mt-1 text-[14px] text-text-secondary">
            Informasi dasar dan rekening penerima pembayaran.
          </p>
        </div>

        <div class="space-y-6 p-5 sm:p-7">
          <div>
            <label for="name" class="mb-2 block text-[14px] font-medium">
              Nama Organisasi <span class="text-alert">*</span>
            </label>

            <input id="name" v-model="form.name" placeholder="Contoh: Lingo English Course"
              :disabled="organizationStore.isLoading"
              class="w-full rounded-xl border border-slate-200 px-4 py-3 text-[14px] outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 disabled:bg-slate-100" />

            <p v-if="errors.name" class="mt-1 text-xs text-alert">
              {{ errors.name }}
            </p>
          </div>

          <div class="grid gap-5 sm:grid-cols-2">
            <div>
              <label for="bank_name" class="mb-2 block text-[14px] font-medium">
                Nama Bank <span class="text-alert">*</span>
              </label>

              <input id="bank_name" v-model="form.bank_name" placeholder="Contoh: BCA"
                :disabled="organizationStore.isLoading"
                class="w-full rounded-xl border border-slate-200 px-4 py-3 text-[14px] outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 disabled:bg-slate-100" />

              <p v-if="errors.bank_name" class="mt-1 text-xs text-alert">
                {{ errors.bank_name }}
              </p>
            </div>

            <div>
              <label for="account_number" class="mb-2 block text-[14px] font-medium">
                Nomor Rekening <span class="text-alert">*</span>
              </label>

              <input id="account_number" v-model="form.account_number" inputmode="numeric" placeholder="Nomor rekening"
                :disabled="organizationStore.isLoading"
                class="w-full rounded-xl border border-slate-200 px-4 py-3 text-[14px] outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 disabled:bg-slate-100" />

              <p v-if="errors.account_number" class="mt-1 text-xs text-alert">
                {{ errors.account_number }}
              </p>
            </div>

            <div class="sm:col-span-2">
              <label for="account_name" class="mb-2 block text-[14px] font-medium">
                Atas Nama Rekening <span class="text-alert">*</span>
              </label>

              <input id="account_name" v-model="form.account_name" placeholder="Nama pemilik rekening"
                :disabled="organizationStore.isLoading"
                class="w-full rounded-xl border border-slate-200 px-4 py-3 text-[14px] outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 disabled:bg-slate-100" />

              <p v-if="errors.account_name" class="mt-1 text-xs text-alert">
                {{ errors.account_name }}
              </p>
            </div>
          </div>

          <div>
            <label for="qris_url" class="mb-2 block text-[14px] font-medium">
              URL QRIS <span class="text-slate-400">(Opsional)</span>
            </label>

            <input id="qris_url" v-model="form.qris_url" type="url" placeholder="https://example.com/qris.png"
              :disabled="organizationStore.isLoading"
              class="w-full rounded-xl border border-slate-200 px-4 py-3 text-[14px] outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 disabled:bg-slate-100" />

            <p v-if="errors.qris_url" class="mt-1 text-xs text-alert">
              {{ errors.qris_url }}
            </p>
          </div>

          <div>
            <label for="paymentNotes" class="mb-2 block text-[14px] font-medium">
              Catatan Pembayaran <span class="text-slate-400">(Opsional)</span>
            </label>

            <textarea id="paymentNotes" v-model="form.payment_notes" rows="3"
              placeholder="Instruksi tambahan untuk siswa" :disabled="organizationStore.isLoading"
              class="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-[14px] outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 disabled:bg-slate-100" />
          </div>

          <div v-if="organizationStore.error" role="alert"
            class="rounded-xl border border-rose-200 bg-rose-50 p-3 text-[14px] text-rose-700">
            {{ organizationStore.error }}
          </div>
        </div>

        <div
          class="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/70 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <p class="text-xs text-text-secondary">
            Pastikan informasi organisasi sudah benar.
          </p>

          <button type="submit" :disabled="organizationStore.isLoading || userLoading || !currentUserId"
            class="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60">
            <svg v-if="organizationStore.isLoading" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-opacity=".25" stroke-width="3" />
              <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
            </svg>

            {{
              userLoading
                ? 'Memeriksa sesi...'
                : organizationStore.isLoading
                  ? 'Menyimpan...'
                  : 'Simpan & Lanjut'
            }}
          </button>
        </div>
      </form>

      <p class="mt-6 text-center text-xs text-slate-400">
        Lingua · Course management made simpler.
      </p>
    </main>

    <Teleport to="body">
      <div v-if="joinModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
        @click.self="closeJoinModal">
        <section role="dialog" aria-modal="true" aria-labelledby="join-title"
          class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
          <div class="flex items-center justify-between">
            <h2 id="join-title" class="text-lg font-bold">
              Join Organization
            </h2>

            <button type="button" class="rounded-lg px-3 py-2 text-text-secondary hover:bg-slate-100" aria-label="Tutup"
              @click="closeJoinModal">
              ✕
            </button>
          </div>

          <p class="mt-2 text-[14px] leading-6 text-text-secondary">
            Masukkan ID organisasi yang diberikan oleh owner.
          </p>

          <form class="mt-5 space-y-4" @submit.prevent="handleJoin">
            <div>
              <label for="organizationId" class="mb-2 block text-[14px] font-medium">
                Organization ID
              </label>

              <input id="organizationId" v-model="organizationId" :disabled="organizationStore.isLoading"
                placeholder="Masukkan ID organisasi"
                class="w-full rounded-xl border border-slate-200 px-4 py-3 text-[14px] outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 disabled:bg-slate-100" />

              <p v-if="joinError" class="mt-2 text-xs text-alert">
                {{ joinError }}
              </p>
            </div>

            <div class="flex justify-end gap-3">
              <button type="button" class="rounded-xl border border-slate-200 px-4 py-2.5 text-[14px] font-semibold"
                @click="closeJoinModal">
                Batal
              </button>

              <button type="submit" :disabled="organizationStore.isLoading"
                class="rounded-xl bg-primary px-4 py-2.5 text-[14px] font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60">
                {{ organizationStore.isLoading ? 'Memproses...' : 'Lanjutkan' }}
              </button>
            </div>
          </form>
        </section>
      </div>
    </Teleport>
  </div>
</template>
