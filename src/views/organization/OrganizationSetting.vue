
<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { Building2, CreditCard, ScanQrCode } from '@lucide/vue'

import { useOrganizationStore } from '@/stores/organization_stores'
import type { OrganizationSetupInput } from '@/service/organization_service'
import { supabase } from '@/lib/supabase'

import CustomButton from '@/components/CustomButton.vue'

const router = useRouter()
const organizationStore = useOrganizationStore()

const { organization, isLoading, error } = storeToRefs(organizationStore)

const successMessage = ref('')
const pageLoading = ref(true)
const validationError = ref('')

const form = reactive<OrganizationSetupInput>({
    name: '',
    bank_name: '',
    account_number: '',
    account_name: '',
    qris_url: '',
    payment_notes: '',
})

watch(
    organization,
    (org) => {
        if (!org) return

        form.name = org.name ?? ''
        form.bank_name = org.bank_name ?? ''
        form.account_number = org.account_number ?? ''
        form.account_name = org.account_name ?? ''
        form.qris_url = org.qris_url ?? ''
        form.payment_notes = org.payment_notes ?? ''
    },
    { immediate: true },
)

async function loadOrganization() {
    pageLoading.value = true
    organizationStore.clearError()

    try {
        const { data, error: authError } = await supabase.auth.getUser()

        if (authError) throw authError

        if (!data.user) {
            throw new Error('Session login tidak ditemukan. Silakan login kembali.')
        }

        await organizationStore.fetchByOwnerId(data.user.id)

        if (!organization.value) {
            throw new Error('Organization tidak ditemukan.')
        }
    } catch (err) {
        console.error('Failed to load organization:', err)

        if (!organizationStore.error) {
            organizationStore.error =
                err instanceof Error
                    ? err.message
                    : 'Gagal memuat organization settings.'
        }
    } finally {
        pageLoading.value = false
    }
}

function validateForm(): boolean {
    validationError.value = ''

    if (!form.name.trim()) {
        validationError.value = 'Organization name wajib diisi.'
        return false
    }

    if (!form.bank_name.trim()) {
        validationError.value = 'Bank name wajib diisi.'
        return false
    }

    if (!form.account_number.trim()) {
        validationError.value = 'Account number wajib diisi.'
        return false
    }

    if (!/^[0-9 -]+$/.test(form.account_number.trim())) {
        validationError.value = 'Account number tidak valid.'
        return false
    }

    if (!form.account_name.trim()) {
        validationError.value = 'Account holder name wajib diisi.'
        return false
    }

    if (form.qris_url?.trim()) {
        try {
            const url = new URL(form.qris_url.trim())

            if (!['http:', 'https:'].includes(url.protocol)) {
                validationError.value = 'QRIS URL tidak valid.'
                return false
            }
        } catch {
            validationError.value = 'Masukkan QRIS URL yang valid.'
            return false
        }
    }

    return true
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth',
    })
}

async function handleSave() {
    if (isLoading.value || pageLoading.value) return

    successMessage.value = ''
    validationError.value = ''
    organizationStore.clearError()

    scrollToTop()

    if (!validateForm()) return

    try {
        await organizationStore.updateSettings({
            name: form.name.trim(),
            bank_name: form.bank_name.trim(),
            account_number: form.account_number.trim(),
            account_name: form.account_name.trim(),
            qris_url: form.qris_url?.trim() || null,
            payment_notes: form.payment_notes?.trim() || null,
        })

        successMessage.value =
            'Organization settings saved successfully.'
    } catch (err) {
        console.error('Failed to update organization settings:', err)
    }
}

function handleCancel() {
    if (organization.value) {
        form.name = organization.value.name ?? ''
        form.bank_name = organization.value.bank_name ?? ''
        form.account_number = organization.value.account_number ?? ''
        form.account_name = organization.value.account_name ?? ''
        form.qris_url = organization.value.qris_url ?? ''
        form.payment_notes = organization.value.payment_notes ?? ''
    }

    validationError.value = ''
    successMessage.value = ''
    organizationStore.clearError()

    router.back()
}

onMounted(() => {
    void loadOrganization()
})
</script>

<template>
    <div class="mx-auto">
        <header class="mb-8">
            <button
                type="button"
                class="mb-5 text-[14px] font-medium text-text-secondary hover:text-primary"
                @click="router.back()"
            >
                &larr; Back to Dashboard
            </button>

            <h1 class="text-[30px] font-black tracking-tight text-text-primary sm:text-3xl">
                Organization Settings
            </h1>

            <p class="mt-2 text-[14px] leading-6 text-text-secondary sm:text-base">
                Manage your organization's profile and payment information.
            </p>
        </header>

        <section
            v-if="pageLoading || (isLoading && !organization)"
            class="rounded-2xl border border-text-secondary bg-surface p-12 text-center"
        >
            <div class="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-accent border-t-primary"></div>

            <p class="mt-4 text-[14px] text-text-secondary">
                Loading organization settings...
            </p>
        </section>

        <section
            v-else-if="error && !organization"
            class="rounded-2xl border border-red-200 bg-surface p-8"
        >
            <h2 class="font-semibold text-text-primary">
                Unable to Load Organization
            </h2>

            <p class="mt-2 text-[14px] text-alert">
                {{ error }}
            </p>

            <button
                type="button"
                class="mt-5 rounded-xl bg-primary px-5 py-3 text-[14px] font-semibold text-surface hover:bg-[#761217]"
                @click="loadOrganization"
            >
                Try Again
            </button>
        </section>

        <section
            v-else-if="!organization"
            class="rounded-2xl border border-text-secondary bg-surface p-8"
        >
            <h2 class="font-semibold text-text-primary">
                Organization Not Found
            </h2>

            <p class="mt-2 text-[14px] text-text-secondary">
                Your account does not have an organization available to manage.
            </p>
        </section>

        <form
            v-else
            class="space-y-6"
            @submit.prevent="handleSave"
        >
            <div
                v-if="validationError"
                role="alert"
                class="rounded-xl border border-red-200 bg-red-50 p-4 text-[14px] text-alert"
            >
                {{ validationError }}
            </div>

            <div
                v-if="error"
                role="alert"
                class="rounded-xl border border-red-200 bg-red-50 p-4 text-[14px] text-alert"
            >
                {{ error }}
            </div>

            <div
                v-if="successMessage"
                role="status"
                class="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-[14px] text-emerald-700"
            >
                {{ successMessage }}
            </div>

            <section class="overflow-hidden rounded-2xl border border-text-secondary bg-accent shadow-sm">
                <div class="px-5 py-5 sm:px-7">
                    <div class="flex items-center gap-3 border-b border-text-primary pb-5">
                        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-text-primary text-accent">
                            <Building2 />
                        </div>

                        <div>
                            <h2 class="text-[20px] font-black text-text-primary">
                                Organization Information
                            </h2>

                            <p class="mt-1 text-[14px] text-text-primary">
                                Update your organization's name.
                            </p>
                        </div>
                    </div>
                </div>

                <div class="p-5 sm:p-7">
                    <label
                        for="org-name"
                        class="mb-2 block text-[14px] font-semibold text-text-primary"
                    >
                        Organization Name <span class="text-surface">*</span>
                    </label>

                    <input
                        id="org-name"
                        v-model="form.name"
                        type="text"
                        maxlength="150"
                        required
                        :disabled="isLoading"
                        placeholder="Enter your organization name"
                        class="w-full max-w-2xl rounded-xl border border-text-primary px-4 py-3 text-[14px] outline-none transition focus:border-text-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-60"
                    />
                </div>
            </section>

            <section class="overflow-hidden rounded-2xl border border-text-secondary bg-surface shadow-sm">
                <div class="border-b border-slate-100 px-5 py-5 sm:px-7">
                    <div class="flex items-center gap-3">
                        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-surface">
                            <CreditCard />
                        </div>

                        <div>
                            <h2 class="text-[20px] font-black text-primary">
                                Payment Information
                            </h2>

                            <p class="mt-1 text-[14px] text-text-secondary">
                                Set up the bank account used to receive payments.
                            </p>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:gap-6 sm:p-7">
                    <div>
                        <label
                            for="bank-name"
                            class="mb-2 block text-[14px] font-semibold text-slate-700"
                        >
                            Bank Name <span class="text-primary">*</span>
                        </label>

                        <input
                            id="bank-name"
                            v-model="form.bank_name"
                            type="text"
                            required
                            :disabled="isLoading"
                            placeholder="e.g. BCA, BNI, Mandiri"
                            class="w-full rounded-xl border border-text-secondary px-4 py-3 text-[14px] outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-60"
                        />
                    </div>

                    <div>
                        <label
                            for="account-number"
                            class="mb-2 block text-[14px] font-semibold text-slate-700"
                        >
                            Account Number <span class="text-primary">*</span>
                        </label>

                        <input
                            id="account-number"
                            v-model="form.account_number"
                            type="text"
                            inputmode="numeric"
                            autocomplete="off"
                            required
                            :disabled="isLoading"
                            placeholder="Enter account number"
                            class="w-full rounded-xl border border-text-secondary px-4 py-3 text-[14px] outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-60"
                        />
                    </div>

                    <div class="sm:col-span-2">
                        <label
                            for="account-name"
                            class="mb-2 block text-[14px] font-semibold text-slate-700"
                        >
                            Account Holder Name <span class="text-primary">*</span>
                        </label>

                        <input
                            id="account-name"
                            v-model="form.account_name"
                            type="text"
                            required
                            :disabled="isLoading"
                            placeholder="Enter the registered account holder name"
                            class="w-full rounded-xl border border-text-secondary px-4 py-3 text-[14px] outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-60"
                        />
                    </div>
                </div>
            </section>

            <section class="overflow-hidden rounded-2xl border border-text-secondary bg-surface shadow-sm">
                <div class="border-b border-slate-100 px-5 py-5 sm:px-7">
                    <div class="flex items-center gap-3">
                        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-surface">
                            <ScanQrCode />
                        </div>

                        <div>
                            <h2 class="text-[20px] font-black text-primary">
                                Additional Payment Details
                            </h2>

                            <p class="mt-1 text-[14px] text-text-secondary">
                                Add an optional QRIS URL and payment instructions.
                            </p>
                        </div>
                    </div>
                </div>

                <div class="space-y-6 p-5 sm:p-7">
                    <div>
                        <label
                            for="qris-url"
                            class="mb-2 block text-[14px] font-semibold text-slate-700"
                        >
                            QRIS URL <span class="font-normal text-slate-400">(Optional)</span>
                        </label>

                        <input
                            id="qris-url"
                            v-model="form.qris_url"
                            type="url"
                            :disabled="isLoading"
                            placeholder="https://example.com/payment/qris"
                            class="w-full rounded-xl border border-text-secondary px-4 py-3 text-[14px] outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-60"
                        />
                    </div>

                    <div>
                        <label
                            for="payment-notes"
                            class="mb-2 block text-[14px] font-semibold text-slate-700"
                        >
                            Payment Notes <span class="font-normal text-slate-400">(Optional)</span>
                        </label>

                        <textarea
                            id="payment-notes"
                            v-model="form.payment_notes"
                            rows="4"
                            maxlength="1000"
                            :disabled="isLoading"
                            placeholder="Add payment instructions for students..."
                            class="w-full resize-y rounded-xl border border-text-secondary px-4 py-3 text-[14px] leading-6 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-60"
                        ></textarea>
                    </div>

                    <div class="rounded-xl border border-accent bg-accent/20 p-4 text-[14px] leading-6 text-slate-700">
                        Keep your payment information accurate. Students may use these
                        details when registering for your courses.
                    </div>
                </div>
            </section>

            <div class="flex flex-col-reverse gap-3 pb-8 sm:flex-row sm:justify-end">
                <CustomButton
                    type="button"
                    variant="outline"
                    :disabled="isLoading"
                    @click="handleCancel"
                >
                    Cancel
                </CustomButton>

                <CustomButton
                    type="submit"
                    :disabled="isLoading"
                >
                    <span
                        v-if="isLoading"
                        class="h-4 w-4 animate-spin rounded-full border-2 border-surface/40 border-t-surface"
                    ></span>

                    {{ isLoading ? 'Saving Changes...' : 'Save Changes' }}
                </CustomButton>
            </div>
        </form>
    </div>
</template>
