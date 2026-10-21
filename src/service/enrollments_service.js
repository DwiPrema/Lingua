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

export async function updateEnrollmentsStatus(
    enrollmentId,
    statusEnrollment,
    rejectionReason = null,
) {
    let rpcName
    let params

    if (statusEnrollment === StatusEnrollments.APPROVED) {
        rpcName = 'approve_enrollment'
        params = {
            p_enrollment_id: enrollmentId,
        }
    } else if (statusEnrollment === StatusEnrollments.REJECTED) {
        rpcName = 'reject_enrollment'
        params = {
            p_enrollment_id: enrollmentId,
            p_reason: rejectionReason,
        }
    } else {
        throw new Error('Unsupported enrollment status transition.')
    }

    const { error: rpcError } = await supabase.rpc(rpcName, params)

    if (rpcError) {
        throw rpcError
    }

    const { data, error } = await supabase
        .from(DatabaseTableName.enrollmentsCollection)
        .select()
        .eq('id', enrollmentId)
        .single()

    if (error) {
        throw error
    }

    return data
}

export async function getEnrollmentById(enrollmentId) {
    const { data, error } = await supabase
        .from(DatabaseTableName.enrollmentsCollection)
        .select('*')
        .eq('id', enrollmentId)
        .maybeSingle()

    if (error) throw error

    return data
}

export async function getMyEnrollments(studentId) {
    const { data, error } = await supabase
        .from(DatabaseTableName.enrollmentsCollection)
        .select(`
            *,
            course:courses(name),
            program:programs(name)
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })

    if (error) throw error

    return data ?? []
}

export async function deleteEnrollments(enrollmentId) {
    const { error } = await supabase.from(DatabaseTableName.enrollmentsCollection).delete().eq('id', enrollmentId)

    if (error) {
        throw error
    }
}

export async function fetchApprovedStudentByCourseId(courseId) {
    if (!courseId) {
        throw new Error('Course ID is required.')
    }

    const { data, error } = await supabase
        .from(DatabaseTableName.enrollmentsCollection)
        .select(`
            id,
            course_id,
            program_id,
            student_id,
            fullname,
            phone,
            school_name,
            education_level,
            status,
            approved_at,
            enrolled_at,
            created_at
        `)
        .eq('course_id', courseId)
        .in('status', ['approved', 'active'])
        .order('created_at', { ascending: false })

    if (error) {
        throw error
    }

    return data ?? []
}