import { DatabaseTableName } from "@/constant/database_table_name";
import { supabase } from "@/lib/supabase";
import { UpdateUserPayload } from "@/types/user_type";

export async function getDataUser(uid: string) {
    const { data, error } = await supabase
        .from(DatabaseTableName.usersCollection)
        .select('*')
        .eq('id', uid)
        .maybeSingle();

    if (error) {
        throw error;
    }

    if (data === null) {
        throw new Error('User data not found!');
    }

    return data;
}


export async function updateDataUser(uid: string, payload: UpdateUserPayload) {
    const { data, error } = await supabase
        .from(DatabaseTableName.usersCollection)
        .update({
            fullname: payload.fullname,
            nickname: payload.nickname,
            phone: payload.phone,
        })
        .eq('id', uid)
        .select()
        .single()

    if (error) {
        throw error
    }

    return data
}
