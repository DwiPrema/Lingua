import { DatabaseTableName } from "@/constant/database_table_name";
import { StatusEnrollments } from "@/constant/enrollment_status";
import { supabase } from "@/lib/supabase";
import { EnrollmentException } from "@/utils/exception/enrollment_exception";

export async function getActiveEnrollment(studentId, courseId) {
    const approved = StatusEnrollments.APPROVED
    const pending = StatusEnrollments.PENDING

    const { data, error } = await supabase.from(DatabaseTableName.enrollmentsCollection)
        .select()
        .eq('course_id', courseId)
        .eq('student_id', studentId)
        .in('status', [pending, approved])

    if (error) {
        throw error
    }

    return data ?? []
}

export async function addEnrollments(payload) {
    const existingEnrollment = await getActiveEnrollment(
        payload.student_id,
        payload.course_id,
    )

    if (existingEnrollment.length > 0) {
        throw EnrollmentException.alreadyExists()
    }

    const { data, error } = await supabase.from(DatabaseTableName.enrollmentsCollection)
        .insert(payload)
        .select()
        .single()

    if (error) {
        throw error
    }

    return data
}


export async function updateEnrollmentsStatus(enrollmentId, statusEnrollment) {
    const updates = {
        status: statusEnrollment,
    }

    if (statusEnrollment === StatusEnrollments.APPROVED) {
        updates.enrolled_at = new Date().toISOString()
    }

    const { data, error } = await supabase
        .from(DatabaseTableName.enrollmentsCollection)
        .update(updates)
        .eq('id', enrollmentId)
        .select()
        .single()

    if (error) {
        throw error
    }

    return data
}
