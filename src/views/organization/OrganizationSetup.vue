<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useOrganizationStore } from '@/stores/organization_stores'
import { Organization } from '@/types/organization_type'

const router = useRouter()
const organizationStore = useOrganizationStore()

type FormErrors = Partial<Record<keyof Organization, string>>

const form = reactive<Organization>({
  name: '',
  bank_name: '',
  account_number: '',
  account_name: '',
  qris_url: '',
  payment_notes: '',
} as Organization)

const errors = reactive<FormErrors>({})
const joinModalOpen = ref<boolean>(false)
const organizationId = ref<string>('')
const joinError = ref<string>('')

function validateForm(): boolean {
  Object.keys(errors).forEach((key) => {
    delete errors[key as keyof FormErrors]
  })

  if (!form.name.trim()) errors.name = 'Nama organisasi wajib diisi.'
  if (!form.bank_name.trim()) errors.bank_name = 'Nama bank wajib diisi.'
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
      const url = new URL(form.qris_url)
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
  if (!validateForm() || organizationStore.loading) return

  try {
    await organizationStore.saveOrganization({ ...form })
    await router.replace({ name: 'dashboard' })
  } catch {
    organizationStore.error
  }
}

async function handleJoin(): Promise<void> {
  joinError.value = ''

  if (!organizationId.value.trim()) {
    joinError.value = 'Masukkan ID organisasi.'
    return
  }

  joinError.value = 'Fitur join organization belum dihubungkan.'
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
        <RouterLink to="/" class="text-xl font-bold tracking-tight">
          Lingua<span class="text-indigo-600">.</span>
        </RouterLink>

        <span class="text-sm text-slate-500">Instructor onboarding</span>
      </div>
    </header>

    <main class="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div class="mb-8">
        <span class="text-xs font-semibold uppercase tracking-widest text-indigo-600">
          Organization setup
        </span>

        <h1 class="mt-3 text-3xl font-bold tracking-tight">
          Setup Organisasi
        </h1>

        <p class="mt-3 text-sm leading-6 text-slate-500">
          Lengkapi profil organisasi dan informasi pembayaran sebelum
          mulai mengelola course di Lingua.
        </p>
      </div>

      <section class="mb-6 rounded-2xl border border-indigo-100 bg-white p-5 sm:p-6">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="font-semibold">Sudah memiliki organisasi?</h2>
            <p class="mt-1 text-sm text-slate-500">
              Bergabung menggunakan ID dari owner organisasi.
            </p>
          </div>

          <button
            type="button"
            class="rounded-xl border border-indigo-200 px-4 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
            @click="joinModalOpen = true"
          >
            Join Organization
          </button>
        </div>
      </section>

      <form
        class="overflow-hidden rounded-2xl border border-slate-200 bg-white"
        @submit.prevent="handleSubmit"
      >
        <div class="border-b border-slate-100 px-5 py-5 sm:px-7">
          <h2 class="font-semibold">Informasi Organisasi</h2>
          <p class="mt-1 text-sm text-slate-500">
            Informasi dasar dan rekening penerima pembayaran.
          </p>
        </div>

        <div class="space-y-6 p-5 sm:p-7">
          <div>
            <label for="name" class="mb-2 block text-sm font-medium">
              Nama Organisasi <span class="text-rose-500">*</span>
            </label>
            <input
              id="name"
              v-model="form.name"
              placeholder="Contoh: Lingo English Course"
              class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
            />
            <p v-if="errors.name" class="mt-1 text-xs text-rose-600">
              {{ errors.name }}
            </p>
          </div>

          <div class="grid gap-5 sm:grid-cols-2">
            <div>
              <label for="bank_name" class="mb-2 block text-sm font-medium">
                Nama Bank <span class="text-rose-500">*</span>
              </label>
              <input
                id="bank_name"
                v-model="form.bank_name"
                placeholder="Contoh: BCA"
                class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
              />
              <p v-if="errors.bank_name" class="mt-1 text-xs text-rose-600">
                {{ errors.bank_name }}
              </p>
            </div>

            <div>
              <label for="account_number" class="mb-2 block text-sm font-medium">
                Nomor Rekening <span class="text-rose-500">*</span>
              </label>
              <input
                id="account_number"
                v-model="form.account_number"
                inputmode="numeric"
                placeholder="Nomor rekening"
                class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
              />
              <p v-if="errors.account_number" class="mt-1 text-xs text-rose-600">
                {{ errors.account_number }}
              </p>
            </div>

            <div class="sm:col-span-2">
              <label for="account_name" class="mb-2 block text-sm font-medium">
                Atas Nama Rekening <span class="text-rose-500">*</span>
              </label>
              <input
                id="account_name"
                v-model="form.account_name"
                placeholder="Nama pemilik rekening"
                class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
              />
              <p v-if="errors.account_name" class="mt-1 text-xs text-rose-600">
                {{ errors.account_name }}
              </p>
            </div>
          </div>

          <div>
            <label for="qris_url" class="mb-2 block text-sm font-medium">
              URL QRIS <span class="text-slate-400">(Opsional)</span>
            </label>
            <input
              id="qris_url"
              v-model="form.qris_url"
              type="url"
              placeholder="https://example.com/qris.png"
              class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
            />
            <p v-if="errors.qris_url" class="mt-1 text-xs text-rose-600">
              {{ errors.qris_url }}
            </p>
          </div>

          <div>
            <label for="paymentNotes" class="mb-2 block text-sm font-medium">
              Catatan Pembayaran <span class="text-slate-400">(Opsional)</span>
            </label>
            <textarea
              id="paymentNotes"
              v-model="form.payment_notes"
              rows="3"
              placeholder="Instruksi tambahan untuk siswa"
              class="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
            />
          </div>

          <div
            v-if="organizationStore.error"
            role="alert"
            class="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
          >
            {{ organizationStore.error }}
          </div>
        </div>

        <div class="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/70 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <p class="text-xs text-slate-500">
            Pastikan informasi organisasi sudah benar.
          </p>

          <button
            type="submit"
            :disabled="organizationStore.loading"
            class="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg
              v-if="organizationStore.loading"
              class="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-opacity=".25" stroke-width="3"/>
              <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
            </svg>
            {{
              organizationStore.loading
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
      <div
        v-if="joinModalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
        @click.self="joinModalOpen = false"
      >
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="join-title"
          class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        >
          <div class="flex items-center justify-between">
            <h2 id="join-title" class="text-lg font-bold">
              Join Organization
            </h2>
            <button
              type="button"
              class="rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-100"
              aria-label="Tutup"
              @click="joinModalOpen = false"
            >
              ✕
            </button>
          </div>

          <p class="mt-2 text-sm leading-6 text-slate-500">
            Masukkan ID organisasi yang diberikan oleh owner.
          </p>

          <form class="mt-5 space-y-4" @submit.prevent="handleJoin">
            <div>
              <label for="organizationId" class="mb-2 block text-sm font-medium">
                Organization ID
              </label>
              <input
                id="organizationId"
                v-model="organizationId"
                placeholder="Masukkan ID organisasi"
                class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
              />
              <p v-if="joinError" class="mt-2 text-xs text-rose-600">
                {{ joinError }}
              </p>
            </div>

            <div class="flex justify-end gap-3">
              <button
                type="button"
                class="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold"
                @click="joinModalOpen = false"
              >
                Batal
              </button>
              <button
                type="submit"
                class="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Lanjutkan
              </button>
            </div>
          </form>
        </section>
      </div>
    </Teleport>
  </div>
</template>