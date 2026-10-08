import { DatabaseTableName } from "@/constant/database_table_name";
import { supabase } from "@/lib/supabase";

export async function getDataUser(uid) {
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