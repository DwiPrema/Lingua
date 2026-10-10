
<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useOrganizationStore } from '@/stores/organization_stores'

const router = useRouter()
const organizationStore = useOrganizationStore()

const form = reactive({
  name: '',
  bankName: '',
  accountNumber: '',
  accountName: '',
  qrisUrl: '',
  paymentNotes: '',
})

const errors = reactive({})
const joinModalOpen = ref(false)
const organizationId = ref('')
const joining = ref(false)
const joinError = ref('')

function validateForm() {
  Object.keys(errors).forEach((key) => delete errors[key])

  if (!form.name.trim()) errors.name = 'Nama organisasi wajib diisi.'
  if (!form.bankName.trim()) errors.bankName = 'Nama bank wajib diisi.'
  if (!form.accountNumber.trim()) {
    errors.accountNumber = 'Nomor rekening wajib diisi.'
  } else if (!/^[0-9 -]+$/.test(form.accountNumber.trim())) {
    errors.accountNumber = 'Nomor rekening tidak valid.'
  }
  if (!form.accountName.trim()) {
    errors.accountName = 'Nama pemilik rekening wajib diisi.'
  }

  if (form.qrisUrl.trim()) {
    try {
      const url = new URL(form.qrisUrl)
      if (!['http:', 'https:'].includes(url.protocol)) {
        errors.qrisUrl = 'URL QRIS tidak valid.'
      }
    } catch {
      errors.qrisUrl = 'Masukkan URL QRIS yang valid.'
    }
  }

  return Object.keys(errors).length === 0
}

async function handleSubmit() {
  if (!validateForm() || organizationStore.loading) return

  try {
    await organizationStore.saveOrganization({ ...form })
    await router.replace({ name: 'dashboard' })
  } catch {
    // Pesan error ditampilkan dari store.
  }
}

async function handleJoin() {
  joinError.value = ''

  if (!organizationId.value.trim()) {
    joinError.value = 'Masukkan ID organisasi.'
    return
  }

  // Join belum terhubung ke service/store.
  // Jangan menganggap user sudah bergabung sampai server mengonfirmasi.
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
              <label for="bankName" class="mb-2 block text-sm font-medium">
                Nama Bank <span class="text-rose-500">*</span>
              </label>
              <input
                id="bankName"
                v-model="form.bankName"
                placeholder="Contoh: BCA"
                class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
              />
              <p v-if="errors.bankName" class="mt-1 text-xs text-rose-600">
                {{ errors.bankName }}
              </p>
            </div>

            <div>
              <label for="accountNumber" class="mb-2 block text-sm font-medium">
                Nomor Rekening <span class="text-rose-500">*</span>
              </label>
              <input
                id="accountNumber"
                v-model="form.accountNumber"
                inputmode="numeric"
                placeholder="Nomor rekening"
                class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
              />
              <p v-if="errors.accountNumber" class="mt-1 text-xs text-rose-600">
                {{ errors.accountNumber }}
              </p>
            </div>

            <div class="sm:col-span-2">
              <label for="accountName" class="mb-2 block text-sm font-medium">
                Atas Nama Rekening <span class="text-rose-500">*</span>
              </label>
              <input
                id="accountName"
                v-model="form.accountName"
                placeholder="Nama pemilik rekening"
                class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
              />
              <p v-if="errors.accountName" class="mt-1 text-xs text-rose-600">
                {{ errors.accountName }}
              </p>
            </div>
          </div>

          <div>
            <label for="qrisUrl" class="mb-2 block text-sm font-medium">
              URL QRIS <span class="text-slate-400">(Opsional)</span>
            </label>
            <input
              id="qrisUrl"
              v-model="form.qrisUrl"
              type="url"
              placeholder="https://example.com/qris.png"
              class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
            />
            <p v-if="errors.qrisUrl" class="mt-1 text-xs text-rose-600">
              {{ errors.qrisUrl }}
            </p>
          </div>

          <div>
            <label for="paymentNotes" class="mb-2 block text-sm font-medium">
              Catatan Pembayaran <span class="text-slate-400">(Opsional)</span>
            </label>
            <textarea
              id="paymentNotes"
              v-model="form.paymentNotes"
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
                @click="handleJoin"
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
