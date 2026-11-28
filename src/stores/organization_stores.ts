
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import type { Organization } from '@/types/organization_type'
import { organizationService, type OrganizationSetupInput } from '@/service/organization_service'

export const useOrganizationStore = defineStore('organization', () => {
  const organization = ref<Organization | null>(null)

  const hasOrganization = computed(() => {
    return organization.value !== null
  })

  const isLoading = ref(false)
  const error = ref<string | null>(null)

  function clearError() {
    error.value = null
  }

  async function fetchByOwnerId(ownerId: string) {
    isLoading.value = true
    error.value = null

    try {
      organization.value =
        await organizationService.getByOwnerId(ownerId)

      return organization.value
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Gagal mengambil data organization.'

      error.value = message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function completeSetup(payload: OrganizationSetupInput) {
    isLoading.value = true
    error.value = null

    try {
      const result = await organizationService.completeSetup(payload)

      organization.value = result

      return result
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Organization setup gagal.'

      error.value = message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateSettings(payload: OrganizationSetupInput) {
    isLoading.value = true
    error.value = null

    try {
      const result = await organizationService.updateSettings(payload)

      organization.value = result

      return result
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : 'Gagal memperbarui organization settings.'

      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchMyOrganization(): Promise<Organization | null> {
    isLoading.value = true
    error.value = null

    try {
      const result = await organizationService.fetchMyOrganization()

      organization.value = result

      return result
    } catch (err) {
      console.error('Failed to fetch my organization:', err)

      error.value =
        err instanceof Error
          ? err.message
          : 'Failed to fetch organization.'

      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function joinOrganization(organizationId: string) {
    isLoading.value = true
    error.value = null

    try {
      const result =
        await organizationService.joinOrganization(organizationId)

      organization.value = result

      return result
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : 'Gagal bergabung dengan organisasi.'

      throw err
    } finally {
      isLoading.value = false
    }
  }

  function resetOrganization() {
    organization.value = null
    error.value = null
  }

  return {
    organization,
    isLoading,
    error,
    hasOrganization,

    clearError,
    fetchByOwnerId,
    completeSetup,
    updateSettings,
    joinOrganization,
    resetOrganization,
    fetchMyOrganization,
  }
})
