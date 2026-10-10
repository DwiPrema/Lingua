
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { organizationService } from '@/service/organization_service'

export const useOrganizationStore = defineStore('organization', () => {
  // State
  const organization = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const hasOrganization = computed(() => !!organization.value)

  // Actions
  async function fetchMyOrganization() {
    loading.value = true
    error.value = null

    try {
      const { data: { user }, error: authError } =
        await supabase.auth.getUser()

      if (authError) throw authError

      if (!user) {
        throw new Error('Sesi login tidak ditemukan.')
      }

      organization.value =
        await organizationService.getByOwnerId(user.id)

      return organization.value
    } catch (err) {
      error.value = err.message || 'Gagal mengambil data organization.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function saveOrganization(payload) {
    loading.value = true
    error.value = null

    try {
      const { data: { user }, error: authError } =
        await supabase.auth.getUser()

      if (authError) throw authError

      if (!user) {
        throw new Error('Silakan login kembali.')
      }

      const savedOrganization = await organizationService.createOrganization({
        ownerId: user.id,
        name: payload.name,
        bankName: payload.bankName,
        accountNumber: payload.accountNumber,
        accountName: payload.accountName,
        qrisUrl: payload.qrisUrl,
        paymentNotes: payload.paymentNotes,
      })

      organization.value = savedOrganization

      return savedOrganization
    } catch (err) {
      error.value = err.message || 'Gagal menyimpan organization.'
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearOrganization() {
    organization.value = null
    error.value = null
  }

  return {
    organization,
    loading,
    error,
    hasOrganization,
    fetchMyOrganization,
    saveOrganization,
    clearOrganization,
  }
})
