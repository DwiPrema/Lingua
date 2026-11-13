<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import type { Invoice } from "@/types/invoice_type";
import { PaymentMethod, PaymentPayload } from "@/types/payment_type";
import { OrganizationBankAccount } from "@/types/organization_type";

const props = defineProps<{
    invoice: Invoice;
    paymentAccount: OrganizationBankAccount | null
    loading?: boolean;
}>();

const emit = defineEmits<{
    submit: [payload: PaymentPayload];
}>();

const paymentMethod = ref<PaymentMethod>("bank_transfer");
const accountHolderName = ref("");
const paymentDate = ref(
    new Date().toISOString().slice(0, 10)
);
const proofFile = ref<File | null>(null);
const notes = ref("");

const errorMessage = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

const formattedAmount = computed(() => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(props.invoice.total_amount);
});

const formattedFileSize = computed(() => {
    if (!proofFile.value) return "";

    return `${(proofFile.value.size / 1024).toFixed(1)} KB`;
});

const allowedTypes = [
    "image/jpeg",
    "image/png",
    "application/pdf",
];


const maxFileSize = 5 * 1024 * 1024;

function handleFileChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    errorMessage.value = null;

    if (!file) return;

    if (!allowedTypes.includes(file.type)) {
        errorMessage.value =
            "Only JPG, PNG, and PDF files are allowed.";

        target.value = "";
        proofFile.value = null;
        return;
    }

    if (file.size > maxFileSize) {
        errorMessage.value =
            "File size must not exceed 5 MB.";

        target.value = "";
        proofFile.value = null;
        return;
    }

    proofFile.value = file;
}

function handleSubmit() {
    errorMessage.value = null;

    if (!accountHolderName.value.trim()) {
        errorMessage.value =
            "Please enter the account holder name.";
        return;
    }

    if (!paymentDate.value) {
        errorMessage.value =
            "Please select the payment date.";
        return;
    }

    if (paymentDate.value > new Date().toISOString().slice(0, 10)) {
        errorMessage.value =
            "Payment date cannot be in the future.";
        return;
    }

    if (!proofFile.value) {
        errorMessage.value =
            "Please upload your payment proof.";
        return;
    }

    if (
        !Number.isFinite(props.invoice.total_amount) ||
        props.invoice.total_amount <= 0
    ) {
        errorMessage.value = "Invalid invoice amount.";
        return;
    }

    emit("submit", {
        invoice_id: props.invoice.id,
        amount: props.invoice.total_amount,
        payment_method: paymentMethod.value,
        account_holder_name: accountHolderName.value.trim(),
        payment_date: paymentDate.value,
        proof_file: proofFile.value,
        notes: notes.value.trim() || null,
    });
}

onMounted(() => {

})
</script>

<template>
    <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Invoice Information -->
        <section class="rounded-xl border-black border-2
                 p-5 bg-accent/90">
            <div class="mb-4">
                <h3 class="font-black text-black text-2xl">
                    Invoice Information
                </h3>

                <p class="text-sm text-gray-800">
                    Review your invoice before making payment.
                </p>
            </div>

            <div class="space-y-3">
                <div class="flex justify-between gap-4 text-sm">
                    <span class="text-gray-800">Invoice Number</span>

                    <span class="font-medium text-gray-900">
                        {{ invoice.invoice_number }}
                    </span>
                </div>


                <div class="h-px w-auto bg-gray-800 rounded-full"></div>

                <div class="flex justify-between gap-4 text-sm">
                    <span class="text-gray-800">Invoice Type</span>

                    <span class="font-medium text-gray-900">
                        {{ invoice.invoice_type }}
                    </span>
                </div>

                <div class="border-t border-gray-800 pt-3">
                    <div class="flex justify-between items-center gap-4">
                        <span class="font-black text-black">
                            Total Payment
                        </span>

                        <span class="text-xl font-bold text-black">
                            {{ formattedAmount }}
                        </span>
                    </div>
                </div>
            </div>
        </section>

        <!-- Payment Method -->
        <section class="space-y-3">
            <div>
                <h3 class="font-black text-gray-900">
                    Payment Method
                </h3>

                <p class="text-sm font-light text-gray-800">
                    Select your payment method.
                </p>
            </div>

            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label class="flex cursor-pointer items-center gap-3
                           rounded-xl border p-4 transition" :class="paymentMethod === 'bank_transfer'
                            ? 'border-accent bg-accent/5'
                            : 'border-gray-200'">
                    <input v-model="paymentMethod" type="radio" value="bank_transfer" class="accent-accent" />

                    <div>
                        <p class="font-medium text-gray-900">
                            Bank Transfer
                        </p>

                        <p class="text-xs font-light text-gray-500">
                            Transfer through your bank.
                        </p>
                    </div>
                </label>

                <label v-if="paymentAccount?.qris_url" class="flex cursor-pointer items-center gap-3
                           rounded-xl border p-4 transition" :class="paymentMethod === 'qris'
                            ? 'border-accent bg-accent/5'
                            : 'border-gray-200'">
                    <input v-model="paymentMethod" type="radio" value="qris" class="accent-accent" />

                    <div>
                        <p class="font-medium text-gray-900">
                            QRIS
                        </p>

                        <p class="text-xs font-light text-gray-500">
                            Pay using QRIS.
                        </p>
                    </div>
                </label>
            </div>
        </section>

        <section class="rounded-xl border p-4">
            <h3 class="font-semibold text-lg">
                Payment Information
            </h3>

            <div class="mt-4 space-y-3">
                <div>
                    <p class="text-sm text-gray-500">Bank</p>
                    <p class="font-medium">
                        {{ paymentAccount?.bank_name ?? "kosong" }}
                    </p>
                </div>

                <div>
                    <p class="text-sm text-gray-500">Account Number</p>
                    <p class="font-medium">
                        {{ paymentAccount?.account_number ?? "kosong" }}
                    </p>
                </div>

                <div>
                    <p class="text-sm text-gray-500">Account Holder</p>
                    <p class="font-medium">
                        {{ paymentAccount?.account_name ?? "kosong" }}
                    </p>
                </div>

                <div v-if="paymentAccount?.payment_notes">
                    <p class="text-sm text-gray-500">Payment Notes</p>
                    <p>{{ paymentAccount?.payment_notes ?? "kosong" }}</p>
                </div>

                <div v-if="paymentAccount?.qris_url">
                    <p class="text-sm text-gray-500">QRIS</p>
                    <img :src="paymentAccount?.qris_url" alt="Organization QRIS" class="w-48 rounded-lg" />
                </div>
            </div>
        </section>

        <!-- Payment Details -->
        <section class="space-y-4">
            <h3 class="font-black text-gray-900">
                Payment Details
            </h3>

            <div class="space-y-2">
                <label for="account-holder" class="text-sm font-medium text-gray-700">
                    Account Holder Name
                </label>

                <input id="account-holder" v-model="accountHolderName" type="text" maxlength="100" autocomplete="name"
                    placeholder="Enter account holder name" class="w-full rounded-lg border border-gray-300
                           bg-white px-4 py-3 text-sm outline-none
                           focus:border-primary focus:ring-2
                           focus:ring-primary/20" />
            </div>

            <div class="space-y-2">
                <label class="text-sm font-medium text-gray-700">
                    Payment Amount
                </label>

                <input :value="formattedAmount" type="text" readonly class="w-full rounded-lg border border-gray-200
                           bg-gray-100 px-4 py-3 text-sm font-semibold
                           text-gray-700" />

                <p class="text-xs text-gray-500">
                    Payment amount follows the invoice total.
                </p>
            </div>

            <div class="space-y-2">
                <label for="payment-date" class="text-sm font-medium text-gray-700">
                    Payment Date
                </label>

                <input id="payment-date" v-model="paymentDate" type="date" :max="new Date().toISOString().slice(0, 10)"
                    class="w-full rounded-lg border border-gray-300
                           bg-white px-4 py-3 text-sm outline-none
                           focus:border-primary focus:ring-2
                           focus:ring-primary/20" />
            </div>
        </section>

        <!-- Payment Proof -->
        <section class="space-y-3">
            <div>
                <h3 class="font-semibold text-gray-900 ">
                    Payment Proof
                </h3>

                <p class="text-sm text-gray-500">
                    Upload your transfer receipt or payment screenshot.
                </p>
            </div>

            <input ref="fileInput" type="file" accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                class="hidden" @change="handleFileChange" />

            <button type="button" @click="fileInput?.click()" class="flex w-full flex-col items-center justify-center
                       gap-2 rounded-xl border-2 border-dashed
                       border-gray-300 p-8 text-center
                       transition hover:border-primary">
                <span class="text-3xl text-gray-400">
                    ↑
                </span>

                <span class="font-medium text-gray-900">
                    {{ proofFile ? "Change payment proof" : "Click to upload" }}
                </span>

                <span class="text-xs text-gray-500">
                    JPG, PNG, PDF (Maximum 5 MB)
                </span>
            </button>

            <div v-if="proofFile" class="flex items-center justify-between gap-3
                       rounded-lg border border-gray-200 p-3">
                <div class="min-w-0">
                    <p class="truncate text-sm font-medium text-gray-900">
                        {{ proofFile.name }}
                    </p>

                    <p class="text-xs text-gray-500">
                        {{ formattedFileSize }}
                    </p>
                </div>

                <button type="button" @click="proofFile = null; if (fileInput) fileInput.value = ''"
                    class="text-sm text-red-500 hover:text-red-600">
                    Remove
                </button>
            </div>
        </section>

        <!-- Additional Notes -->
        <section class="space-y-2">
            <label for="payment-notes" class="text-sm font-medium text-gray-700">
                Additional Notes
                <span class="font-normal text-gray-400">
                    (Optional)
                </span>
            </label>

            <textarea id="payment-notes" v-model="notes" rows="3" maxlength="500"
                placeholder="Additional information about your payment..." class="w-full resize-none rounded-lg border
                       border-gray-300 bg-white px-4 py-3
                       text-sm outline-none focus:border-primary
                       focus:ring-2 focus:ring-primary/20"/>
        </section>

        <!-- Error Message -->
        <div v-if="errorMessage" role="alert" class="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {{ errorMessage }}
        </div>

        <!-- Submit -->
        <div class="space-y-3 border-t border-gray-200 pt-5">
            <p class="text-xs leading-relaxed text-gray-500">
                By submitting this payment, you confirm that all
                information provided is accurate.
            </p>

            <button type="submit" :disabled="loading" class="w-full rounded-lg bg-primary px-5 py-3
                       font-semibold text-white transition
                       hover:opacity-90 disabled:cursor-not-allowed
                       disabled:opacity-50">
                {{ loading ? "Submitting..." : "Submit Payment" }}
            </button>
        </div>
    </form>
</template>
