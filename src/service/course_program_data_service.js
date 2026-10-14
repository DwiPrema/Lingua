import { DatabaseTableName } from "@/constant/database_table_name"
import { supabase } from "@/lib/supabase"

export const courseProgramService = {

    //ADD COURSE PROGRAM
    async addCourseProgram({
        courseId,
        name,
        description,
        registrationFee,
        monthlyFee,
    }) {
        const { data, error } = await supabase.from(DatabaseTableName.programsCollection)
            .insert({
                course_id: courseId,
                name: name,
                description: description,
                registration_fee: registrationFee,
                monthly_fee: monthlyFee,
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
        programId,
        programName,
        description,
        registrationFee,
        monthlyFee,
    }) {
        const { data, error } = await supabase.from(DatabaseTableName.programsCollection)
            .update({
                name: programName,
                description: description,
                registration_fee: registrationFee,
                monthly_fee: monthlyFee,
            })
            .eq('id', programId)
            .select().single();

            if (error) {
                throw error
            }

            return data;
    },


    //DELETE COURSE PROGRAM
    async deleteCourseProgram({programId}) {
        const {error} = await supabase.from(DatabaseTableName.programsCollection).delete().eq('id', programId)

        if(error) {
            throw error;
        }
    },


    //GET ALL COURSE PROGRAM
    async getAllCourseProgram({courseId}){
        const {data, error} = await supabase.from(DatabaseTableName.programsCollection).select().eq('course_id', courseId);

        if(error) {
            throw error
        }

        return data
    }
}