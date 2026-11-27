<script setup lang="ts">
import { onMounted, reactive, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";

import { useOrganizationStore } from "@/stores/organization_stores";
import { Building2, CreditCard, ScanQrCode } from "@lucide/vue";
import { Organization } from "@/types/organization_type";
import CustomButton from "@/components/CustomButton.vue";

const router = useRouter();
const organizationStore = useOrganizationStore();

const { organization, loading, error } = storeToRefs(
    organizationStore,
);

const successMessage = ref<string>("");

const form = reactive({
    name: "",
    bankName: "",
    accountNumber: "",
    accountName: "",
    qrisUrl: "",
    paymentNotes: "",
});

watch(
    organization,
    (org) => {
        if (!org) return;

        form.name = org.name ?? "";
        form.bankName = org.bank_name ?? "";
        form.accountNumber = org.account_number ?? "";
        form.accountName = org.account_name ?? "";
        form.qrisUrl = org.qris_url ?? "";
        form.paymentNotes = org.payment_notes ?? "";
    },
    { immediate: true },
);

onMounted(async () => {
    if (organization.value) return;

    try {
        await organizationStore.fetchMyOrganization();
    } catch {

    }
});

function validateForm() {
    return (
        form.name.trim() &&
        form.bankName.trim() &&
        form.accountNumber.trim() &&
        form.accountName.trim()
    );
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: "smooth",
    });
}

async function handleSave() {
    successMessage.value = "";

    scrollToTop()

    if (!validateForm()) return;

    try {
        await organizationStore.saveOrganization({
            name: form.name.trim(),
            bank_name: form.bankName.trim(),
            account_number: form.accountNumber.trim(),
            account_name: form.accountName.trim(),
            qris_url: form.qrisUrl.trim(),
            payment_notes: form.paymentNotes.trim(),
        } as Organization);

        successMessage.value =
            "Organization settings saved successfully.";
    } catch {

    }
}
</script>

<template>
    <div class="mx-auto">
        <!-- Page Header -->
        <header class="mb-8">
            <button type="button" class="mb-5 text-[14px] font-medium text-text-secondary hover:text-primary"
                @click="router.back()">
                &larr; Back to Dashboard
            </button>

            <h1 class="text-[30px] font-black tracking-tight text-text-primary sm:text-3xl">
                Organization Settings
            </h1>

            <p class="mt-2 text-[14px] leading-6 text-text-secondary sm:text-base">
                Manage your organization's profile and payment information.
            </p>
        </header>

        <!-- Loading State -->
        <section v-if="loading && !organization"
            class="rounded-2xl border border-text-secondary bg-surface p-12 text-center">
            <div class="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-accent border-t-primary"></div>

            <p class="mt-4 text-[14px] text-text-secondary">
                Loading organization settings...
            </p>
        </section>

        <!-- Load Error -->
        <section v-else-if="error && !organization" class="rounded-2xl border border-red-200 bg-surface p-8">
            <h2 class="font-semibold text-text-primary">
                Unable to Load Organization
            </h2>

            <p class="mt-2 text-[14px] text-alert">
                {{ error }}
            </p>

            <button type="button"
                class="mt-5 rounded-xl bg-primary px-5 py-3 text-[14px] font-semibold text-surface hover:bg-[#761217]"
                @click="organizationStore.fetchMyOrganization()">
                Try Again
            </button>
        </section>

        <!-- Settings Form -->
        <form v-else class="space-y-6" @submit.prevent="handleSave">
            <!-- Feedback -->
            <div v-if="error" role="alert"
                class="rounded-xl border border-red-200 bg-red-50 p-4 text-[14px] text-alert">
                {{ error }}
            </div>

            <div v-if="successMessage" role="status"
                class="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-[14px] text-emerald-700">
                {{ successMessage }}
            </div>

            <!-- Organization Information -->
            <section class="overflow-hidden rounded-2xl border border-text-secondary bg-accent shadow-sm">
                <div class="px-5 py-5 sm:px-7">
                    <div class="pb-5 border-b border-text-primary flex items-center gap-3">
                        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-text-primary text-accent">
                            <Building2 />
                        </div>

                        <div>
                            <h2 class="font-black text-[20px] text-text-primary">
                                Organization Information
                            </h2>
                            <p class="mt-1 text-[14px] text-text-primary">
                                Update your organization's name.
                            </p>
                        </div>
                    </div>
                </div>

                <div class="p-5 sm:p-7">
                    <label for="org-name" class="mb-2 block text-[14px] font-semibold text-text-primary">
                        Organization Name <span class="text-surface">*</span>
                    </label>

                    <input id="org-name" v-model="form.name" type="text" maxlength="150" required
                        placeholder="Enter your organization name"
                        class="w-full max-w-2xl rounded-xl border border-text-primary px-4 py-3 text-[14px] outline-none transition focus:border-text-primary focus:ring-4 focus:ring-primary/10" />
                </div>
            </section>

            <!-- Payment Information -->
            <section class="overflow-hidden rounded-2xl border border-text-secondary bg-surface shadow-sm">
                <div class="border-b border-slate-100 px-5 py-5 sm:px-7">
                    <div class="flex items-center gap-3">
                        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-surface">
                            <CreditCard />
                        </div>

                        <div>
                            <h2 class="font-black text-[20px] text-primary">
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
                        <label for="bank-name" class="mb-2 block text-[14px] font-semibold text-slate-700">
                            Bank Name <span class="text-primary">*</span>
                        </label>
                        <input id="bank-name" v-model="form.bankName" type="text" required
                            placeholder="e.g. BCA, BNI, Mandiri"
                            class="w-full rounded-xl border border-text-secondary px-4 py-3 text-[14px] outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" />
                    </div>

                    <div>
                        <label for="account-number" class="mb-2 block text-[14px] font-semibold text-slate-700">
                            Account Number <span class="text-primary">*</span>
                        </label>
                        <input id="account-number" v-model="form.accountNumber" type="text" inputmode="numeric"
                            autocomplete="off" required placeholder="Enter account number"
                            class="w-full rounded-xl border border-text-secondary px-4 py-3 text-[14px] outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" />
                    </div>

                    <div class="sm:col-span-2">
                        <label for="account-name" class="mb-2 block text-[14px] font-semibold text-slate-700">
                            Account Holder Name <span class="text-primary">*</span>
                        </label>
                        <input id="account-name" v-model="form.accountName" type="text" required
                            placeholder="Enter the registered account holder name"
                            class="w-full rounded-xl border border-text-secondary px-4 py-3 text-[14px] outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" />
                    </div>
                </div>
            </section>

            <!-- Additional Payment Details -->
            <section class="overflow-hidden rounded-2xl border border-text-secondary bg-surface shadow-sm">
                <div class="border-b border-slate-100 px-5 py-5 sm:px-7">
                    <div class="flex items-center gap-3">
                        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-surface">
                            <ScanQrCode />
                        </div>

                        <div>
                            <h2 class="font-black text-[20px] text-primary">
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
                        <label for="qris-url" class="mb-2 block text-[14px] font-semibold text-slate-700">
                            QRIS URL <span class="font-normal text-slate-400">(Optional)</span>
                        </label>
                        <input id="qris-url" v-model="form.qrisUrl" type="url"
                            placeholder="https://example.com/payment/qris"
                            class="w-full rounded-xl border border-text-secondary px-4 py-3 text-[14px] outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" />
                    </div>

                    <div>
                        <label for="payment-notes" class="mb-2 block text-[14px] font-semibold text-slate-700">
                            Payment Notes <span class="font-normal text-slate-400">(Optional)</span>
                        </label>
                        <textarea id="payment-notes" v-model="form.paymentNotes" rows="4" maxlength="1000"
                            placeholder="Add payment instructions for students..."
                            class="w-full resize-y rounded-xl border border-text-secondary px-4 py-3 text-[14px] leading-6 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"></textarea>
                    </div>

                    <div class="rounded-xl border border-accent bg-accent/20 p-4 text-[14px] leading-6 text-slate-700">
                        Keep your payment information accurate. Students may use these
                        details when registering for your courses.
                    </div>
                </div>
            </section>

            <!-- Actions -->
            <div class="flex flex-col-reverse gap-3 pb-8 sm:flex-row sm:justify-end">
                <CustomButton @click="router.back()" variant="outline">Cancel</CustomButton>

                <CustomButton type="submit" :disabled="loading">
                    <span v-if="loading"
                        class="h-4 w-4 animate-spin rounded-full border-2 border-surface/40 border-t-surface"></span>
                    {{ loading ? "Saving Changes..." : "Save Changes" }}
                </CustomButton>
            </div>
        </form>
    </div>
</template>
