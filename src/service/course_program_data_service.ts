import { DatabaseTableName } from "@/constant/database_table_name"
import { supabase } from "@/lib/supabase"
import { CreateProgramInput, Programs, UpdateProgramInput } from "@/types/program_types";

export const courseProgramService = {

    //ADD COURSE PROGRAM
    async addCourseProgram({
        course_id,
        name,
        description,
        registration_fee,
        monthly_fee,
    }: CreateProgramInput) {
        const { data, error } = await supabase.from(DatabaseTableName.programsCollection)
            .insert({
                course_id: course_id,
                name: name,
                description: description,
                registration_fee: registration_fee,
                monthly_fee: monthly_fee,
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        return data;
    },


    //UPDATE COURSE PROGRAM
    async updateCourseProgram({
        id,
        name,
        description,
        registration_fee,
        monthly_fee,
    }: UpdateProgramInput) {
        const { data, error } = await supabase.from(DatabaseTableName.programsCollection)
            .update({
                name: name,
                description: description,
                registration_fee: registration_fee,
                monthly_fee: monthly_fee,
            })
            .eq('id', id)
            .select().single();

            if (error) {
                throw error
            }

            return data;
    },


    //DELETE COURSE PROGRAM
    async deleteCourseProgram(programId: string) {
        const {error} = await supabase.from(DatabaseTableName.programsCollection).delete().eq('id', programId)

        if(error) {
            throw error;
        }
    },


    //GET ALL COURSE PROGRAM
    async getAllCourseProgram(courseId: string){
        const {data, error} = await supabase.from(DatabaseTableName.programsCollection).select().eq('course_id', courseId);

        if(error) {
            throw error
        }

        return data
    }
}