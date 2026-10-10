
import { DatabaseTableName } from '@/constant/database_table_name'
import { supabase } from '@/lib/supabase'

const ORGANIZATIONS_TABLE = DatabaseTableName.organizationsCollection
const ORGANIZATION_MEMBERS_TABLE = DatabaseTableName.organizationMemberCollection

export const organizationService = {
    async getByOwnerId(ownerId) {
        const { data, error } = await supabase
            .from(ORGANIZATIONS_TABLE)
            .select('*')
            .eq('owner_id', ownerId)
            .maybeSingle()

        if (error) throw error

        return data
    },

    async createOrganization({
        ownerId,
        name,
        bankName,
        accountNumber,
        accountName,
        qrisUrl = null,
        paymentNotes = null,
    }) {
        if (!ownerId) {
            throw new Error('Owner ID wajib tersedia.')
        }

        const payload = {
            name: name.trim(),
            bank_name: bankName.trim(),
            account_number: accountNumber.trim(),
            account_name: accountName.trim(),
            qris_url: qrisUrl?.trim() || null,
            payment_notes: paymentNotes?.trim() || null,
        }

        try {
            const existing = await this.getByOwnerId(ownerId)

            if (!existing) {
                const { data: inserted, error: insertError } = await supabase
                    .from(ORGANIZATIONS_TABLE)
                    .insert({
                        ...payload,
                        owner_id: ownerId,
                    })
                    .select()
                    .single()

                if (insertError) throw insertError

                const { error: memberError } = await supabase
                    .from(ORGANIZATION_MEMBERS_TABLE)
                    .insert({
                        organization_id: inserted.id,
                        admin_id: ownerId,
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
                .eq('owner_id', ownerId)
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
