
import { DatabaseTableName } from '@/constant/database_table_name'
import { supabase } from '@/lib/supabase'
import { Organization } from '@/types/organization_type'

const ORGANIZATIONS_TABLE = DatabaseTableName.organizationsCollection
const ORGANIZATION_MEMBERS_TABLE = DatabaseTableName.organizationMemberCollection

export const organizationService = {
    async getByOwnerId(ownerId: string) {
        const { data, error } = await supabase
            .from(ORGANIZATIONS_TABLE)
            .select('*')
            .eq('owner_id', ownerId)
            .maybeSingle()

        if (error) throw error

        return data
    },

    async createOrganization({
        owner_id,
        name,
        bank_name,
        account_number,
        account_name,
        qris_url = null,
        payment_notes = null,
    }: Organization) {
        if (!owner_id) {
            throw new Error('Owner ID wajib tersedia.')
        }

        const payload = {
            name: name.trim(),
            bank_name: bank_name.trim(),
            account_number: account_number.trim(),
            account_name: account_name.trim(),
            qris_url: qris_url?.trim() || null,
            payment_notes: payment_notes?.trim() || null,
        }

        try {
            const existing = await this.getByOwnerId(owner_id)

            if (!existing) {
                const { data: inserted, error: insertError } = await supabase
                    .from(ORGANIZATIONS_TABLE)
                    .insert({
                        ...payload,
                        owner_id: owner_id,
                    })
                    .select()
                    .single()

                if (insertError) throw insertError

                const { error: memberError } = await supabase
                    .from(ORGANIZATION_MEMBERS_TABLE)
                    .insert({
                        organization_id: inserted.id,
                        admin_id: owner_id,
                        role: 'owner',
                    })

                if (memberError) {
                    throw memberError
                }

                return inserted
            }

            const { data: updated, error: updateError } = await supabase
                .from(ORGANIZATIONS_TABLE)
                .update(payload)
                .eq('owner_id', owner_id)
                .select()
                .single()

            if (updateError) throw updateError

            return updated
        } catch (error) {
            console.error('organizationService.save:', error)
            throw error
        }
    },
}
