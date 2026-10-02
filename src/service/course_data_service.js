import { DatabaseTableName } from "@/constant/database_table_name";
import { supabase } from "@/lib/supabase";

export async function getAllCourseData() {
    const {data, error} = await supabase.from(DatabaseTableName.coursesCollection).select().order('created_at', {ascending: false})

    if(error) {
        throw error
    }

    return data
}

export async function getCourseForLandingPreview() {
    const {data, error} = await supabase.from(DatabaseTableName.coursesCollection).select().limit(6).order('created_at', {ascending: false})

    if(error) {
        throw error
    }

    return data
}