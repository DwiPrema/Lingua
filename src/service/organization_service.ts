
import { DatabaseTableName } from '@/constant/database_table_name'
import { supabase } from '@/lib/supabase'
import type { Organization } from '@/types/organization_type'

const ORGANIZATIONS_TABLE = DatabaseTableName.organizationsCollection

export type OrganizationSetupInput = {
    name: string
    bank_name: string
    account_number: string
    account_name: string
    qris_url?: string | null
    payment_notes?: string | null
}

export const organizationService = {
    async getByOwnerId(ownerId: string): Promise<Organization | null> {
        if (!ownerId) {
            throw new Error('Owner ID wajib tersedia.')
        }

        const { data, error } = await supabase
            .from(ORGANIZATIONS_TABLE)
            .select('*')
            .eq('owner_id', ownerId)
            .maybeSingle()

        if (error) throw error

        return data as Organization | null
    },


    async fetchMyOrganization(): Promise<Organization | null> {
        const { data: { user }, error: authError } =
            await supabase.auth.getUser()

        if (authError) throw authError

        if (!user) {
            throw new Error('Authentication required.')
        }

        const { data: ownedOrganization, error: ownerError } =
            await supabase
                .from(DatabaseTableName.organizationsCollection)
                .select('*')
                .eq('owner_id', user.id)
                .maybeSingle()

        if (ownerError) throw ownerError

        if (ownedOrganization) {
            return ownedOrganization as Organization
        }

        const { data: membership, error: membershipError } =
            await supabase
                .from(DatabaseTableName.organizationMemberCollection)
                .select('organization_id')
                .eq('admin_id', user.id)
                .maybeSingle()

        if (membershipError) throw membershipError

        if (!membership) {
            return null
        }

        const { data: organization, error: organizationError } =
            await supabase
                .from(DatabaseTableName.organizationsCollection)
                .select('*')
                .eq('id', membership.organization_id)
                .maybeSingle()

        if (organizationError) throw organizationError

        return organization as Organization | null
    },


    async completeSetup(
        payload: OrganizationSetupInput
    ): Promise<Organization> {
        const normalizedPayload = {
            name: payload.name.trim(),
            bank_name: payload.bank_name.trim(),
            account_number: payload.account_number.trim(),
            account_name: payload.account_name.trim(),
            qris_url: payload.qris_url?.trim() || null,
            payment_notes: payload.payment_notes?.trim() || null,
        }

        if (
            !normalizedPayload.name ||
            !normalizedPayload.bank_name ||
            !normalizedPayload.account_number ||
            !normalizedPayload.account_name
        ) {
            throw new Error('Lengkapi seluruh informasi organization.')
        }

        const { data, error } = await supabase.rpc(
            'complete_organization_setup',
            {
                p_name: normalizedPayload.name,
                p_bank_name: normalizedPayload.bank_name,
                p_account_number: normalizedPayload.account_number,
                p_account_name: normalizedPayload.account_name,
                p_qris_url: normalizedPayload.qris_url,
                p_payment_notes: normalizedPayload.payment_notes,
            }
        )

        if (error) throw error

        if (!data) {
            throw new Error('Organization setup gagal diselesaikan.')
        }

        return data as Organization
    },

    async updateSettings(
        payload: OrganizationSetupInput
    ): Promise<Organization> {
        const normalizedPayload = {
            name: payload.name.trim(),
            bank_name: payload.bank_name.trim(),
            account_number: payload.account_number.trim(),
            account_name: payload.account_name.trim(),
            qris_url: payload.qris_url?.trim() || null,
            payment_notes: payload.payment_notes?.trim() || null,
        }

        if (
            !normalizedPayload.name ||
            !normalizedPayload.bank_name ||
            !normalizedPayload.account_number ||
            !normalizedPayload.account_name
        ) {
            throw new Error('Lengkapi seluruh informasi organisasi.')
        }

        const { data, error } = await supabase.rpc(
            'update_organization_settings',
            {
                p_name: normalizedPayload.name,
                p_bank_name: normalizedPayload.bank_name,
                p_account_number: normalizedPayload.account_number,
                p_account_name: normalizedPayload.account_name,
                p_qris_url: normalizedPayload.qris_url,
                p_payment_notes: normalizedPayload.payment_notes,
            }
        )

        if (error) throw error

        if (!data) {
            throw new Error('Gagal memperbarui organization settings.')
        }

        return data as Organization
    },

    async joinOrganization(
        organizationId: string
    ): Promise<Organization> {
        const normalizedId = organizationId.trim()

        if (!normalizedId) {
            throw new Error('Organization ID wajib diisi.')
        }

        const { data, error } = await supabase.rpc(
            'join_organization',
            {
                p_organization_id: normalizedId,
            }
        )

        if (error) throw error

        if (!data) {
            throw new Error('Gagal bergabung dengan organisasi.')
        }

        return data as Organization
    },
}