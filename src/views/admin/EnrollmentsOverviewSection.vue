<script setup lang="ts">
import { formatDate } from '@/composables/formatDate'
import { useEnrollmentStores } from '@/stores/enrollments_stores'
import { useUserDataStores } from '@/stores/user_data_stores'
import type { Enrollment } from '@/types/enrollment_type'
import { Check, Clock3, GraduationCap, MessageSquareWarning, Phone, RefreshCw, School, X } from '@lucide/vue'
import { storeToRefs } from 'pinia'
import { onMounted, ref } from 'vue'
import { useStudentAvatar } from '@/composables/useStudentAvatar'

const { getStudentAvatarUrl } = useStudentAvatar()

const enrollmentStore = useEnrollmentStores()
const userStore = useUserDataStores()

const { enrollments: pendingEnrollments } = storeToRefs(enrollmentStore)

const processingId = ref<string | null>(null)
const rejectingEnrollmentId = ref<string | null>(null)
const rejectionReason = ref('')
const actionError = ref<string | null>(null)

async function fetchStudentAvatars() {
    const studentIds = [
        ...new Set(
            pendingEnrollments.value.map(
                enrollment => enrollment.student_id
            )
        )
    ]

    await Promise.allSettled(
        studentIds.map(studentId =>
            userStore.getUserDataById(studentId)
        )
    )
}

function removeEnrollment(enrollmentId: string) {
    enrollmentStore.enrollments =
        enrollmentStore.enrollments.filter(
            enrollment => enrollment.id !== enrollmentId
        )
}

async function approveEnrollment(enrollment: Enrollment) {
    const confirmed = window.confirm(
        `Setujui pendaftaran ${enrollment.fullname || 'siswa ini'}?`
    )

    if (!confirmed) return

    processingId.value = enrollment.id
    actionError.value = null

    try {
        await enrollmentStore.approveEnrollment(enrollment.id)

        removeEnrollment(enrollment.id)
    } catch (err) {
        const e = err as { message?: string }

        actionError.value =
            e.message ?? 'Gagal menyetujui pendaftaran.'
    } finally {
        processingId.value = null
    }
}

function openRejectForm(enrollment: Enrollment) {
    rejectingEnrollmentId.value = enrollment.id
    rejectionReason.value = ''
    actionError.value = null
}

function cancelReject() {
    rejectingEnrollmentId.value = null
    rejectionReason.value = ''
    actionError.value = null
}

async function rejectEnrollment(enrollment: Enrollment) {
    const reason = rejectionReason.value.trim()

    if (!reason) {
        actionError.value = 'Alasan penolakan wajib diisi.'
        return
    }

    processingId.value = enrollment.id
    actionError.value = null

    try {
        await enrollmentStore.rejectEnrollment(
            enrollment.id,
            reason
        )

        removeEnrollment(enrollment.id)
        cancelReject()
    } catch (err) {
        const e = err as { message?: string }

        actionError.value =
            e.message ?? 'Gagal menolak pendaftaran.'
    } finally {
        processingId.value = null
    }
}

onMounted(async () => {
    try {
        await enrollmentStore.fetchPendingEnrollments()
        await fetchStudentAvatars()
    } catch (err) {
        console.error('Failed to initialize pending enrollments:', err)
    }
})
</script>

<template>
    <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <article v-for="enrollment in pendingEnrollments" :key="enrollment.id" class="overflow-hidden rounded-2xl border
                               border-slate-200 bg-white shadow-sm">
            <div class="space-y-4 p-5">
                <!-- Student heading -->
                <div class="flex items-start gap-3">

                    <!-- Avatar -->
                    <div class="flex size-12 shrink-0 items-center justify-center
    overflow-hidden rounded-full bg-indigo-50 text-[14px] font-bold
    text-indigo-700">
                        <img v-if="getStudentAvatarUrl(enrollment.student_id)"
                            :src="getStudentAvatarUrl(enrollment.student_id)!" alt="Profile photo"
                            class="size-full object-cover" />
                    </div>

                    <div class="min-w-0 flex-1">
                        <h3 class="wrap-break-word font-semibold
                                               text-text-primary">
                            {{ enrollment.fullname || 'Unnamed student' }}
                        </h3>

                        <p class="mt-1 text-xs text-text-secondary">
                            Submitted
                            {{ formatDate(enrollment.created_at) }}
                        </p>
                    </div>

                    <span class="inline-flex shrink-0 items-center gap-1
                                           rounded-full bg-amber-50 px-2.5 py-1
                                           text-xs font-semibold text-amber-700">
                        <Clock3 class="size-3.5" />
                        Pending
                    </span>
                </div>

                <!-- Student details -->
                <div class="space-y-2.5 text-[14px] text-slate-600">
                    <p v-if="enrollment.phone" class="flex items-center gap-2">
                        <Phone class="size-4 shrink-0 text-slate-400" />
                        <span class="break-all">
                            {{ enrollment.phone }}
                        </span>
                    </p>

                    <p v-if="enrollment.school_name" class="flex items-center gap-2">
                        <School class="size-4 shrink-0 text-slate-400" />
                        <span class="wrap-break-word">
                            {{ enrollment.school_name }}
                        </span>
                    </p>

                    <p v-if="enrollment.education_level" class="flex items-center gap-2">
                        <GraduationCap class="size-4 shrink-0 text-slate-400" />
                        <span>{{ enrollment.education_level }}</span>
                    </p>

                    <p v-if="enrollment.address" class="text-[14px] leading-6 text-text-secondary">
                        {{ enrollment.address }}
                    </p>
                </div>

                <!-- Rejection form -->
                <div v-if="rejectingEnrollmentId === enrollment.id" class="space-y-3 rounded-xl border border-red-200
                                       bg-red-50/50 p-4">
                    <div class="flex items-center gap-2">
                        <MessageSquareWarning class="size-5 text-alert/85" />

                        <h4 class="font-semibold text-text-primary">
                            Rejection reason
                        </h4>
                    </div>

                    <label :for="`reason-${enrollment.id}`" class="block text-[14px] text-slate-600">
                        Explain why this application is rejected.
                    </label>

                    <textarea :id="`reason-${enrollment.id}`" v-model="rejectionReason" rows="3" maxlength="1000"
                        placeholder="Enter the reason for rejection..." class="w-full resize-y rounded-xl border
                                           border-slate-200 bg-white px-3 py-2.5
                                           text-[14px] outline-none transition
                                           focus:border-red-400 focus:ring-2
                                           focus:ring-red-100" />

                    <div class="flex flex-wrap justify-end gap-2">
                        <button type="button" :disabled="processingId === enrollment.id" class="rounded-xl border border-slate-200
                                               bg-white px-3 py-2 text-[14px]
                                               font-semibold text-slate-700
                                               hover:bg-slate-100
                                               disabled:opacity-50" @click="cancelReject">
                            Cancel
                        </button>

                        <button type="button" :disabled="processingId === enrollment.id ||
                            !rejectionReason.trim()
                            " class="inline-flex items-center gap-2
                                               rounded-xl bg-alert/85 px-3 py-2
                                               text-[14px] font-semibold text-white
                                               hover:bg-alert
                                               disabled:cursor-not-allowed
                                               disabled:opacity-50" @click="rejectEnrollment(enrollment)">
                            <RefreshCw v-if="processingId === enrollment.id" class="size-4 animate-spin" />
                            <X v-else class="size-4" />
                            Confirm rejection
                        </button>
                    </div>
                </div>

                <!-- Review actions -->
                <div v-else class="flex flex-wrap justify-end gap-2
                                       border-t border-slate-100 pt-4">
                    <button type="button" :disabled="processingId === enrollment.id" class="inline-flex items-center gap-2
                                           rounded-xl border border-red-200
                                           bg-white px-4 py-2.5 text-[14px]
                                           font-semibold text-alert/85
                                           transition hover:bg-red-50
                                           disabled:cursor-not-allowed
                                           disabled:opacity-50" @click="openRejectForm(enrollment)">
                        <X class="size-4" />
                        Reject
                    </button>

                    <button type="button" :disabled="processingId === enrollment.id" class="inline-flex items-center gap-2
                                           rounded-xl bg-emerald-600 px-4 py-2.5
                                           text-[14px] font-semibold text-white
                                           transition hover:bg-emerald-700
                                           disabled:cursor-not-allowed
                                           disabled:opacity-50" @click="approveEnrollment(enrollment)">
                        <RefreshCw v-if="processingId === enrollment.id" class="size-4 animate-spin" />
                        <Check v-else class="size-4" />
                        Approve
                    </button>
                </div>
            </div>
        </article>
    </div>
</template>