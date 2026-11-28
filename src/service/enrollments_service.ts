import { DatabaseTableName } from "@/constant/database_table_name";
import { supabase } from "@/lib/supabase";
import { type CreateEnrollmentPayload, type Enrollment, StatusEnrollments } from "@/types/enrollment_type";
import { EnrollmentException } from "@/utils/exception/enrollment_exception";

export async function getActiveEnrollment(studentId: string, courseId: string) {
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

export async function addEnrollments(payload: CreateEnrollmentPayload) {
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
    enrollmentId: string,
    statusEnrollment: string,
    rejectionReason: string | null = null,
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

export async function getEnrollmentById(
    enrollmentId: string
): Promise<Enrollment> {
    if (!enrollmentId) {
        throw new Error('Enrollment ID is required.')
    }

    const { data, error } = await supabase
        .from(DatabaseTableName.enrollmentsCollection)
        .select('*')
        .eq('id', enrollmentId)
        .maybeSingle()

    if (error) throw error

    if (!data) {
        throw new Error('Enrollment not found.')
    }

    return data as Enrollment
}

export async function getMyEnrollments(studentId: string) {
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

export async function deleteEnrollments(enrollmentId: string) {
    const { error } = await supabase.from(DatabaseTableName.enrollmentsCollection).delete().eq('id', enrollmentId)

    if (error) {
        throw error
    }
}

export async function fetchApprovedStudentByCourseId(courseId: string) {
    if (!courseId) {
        throw new Error('Course ID is required.')
    }

    const { data, error } = await supabase
        .from(DatabaseTableName.enrollmentsCollection)
        .select()
        .eq('course_id', courseId)
        .in('status', ['approved', 'active'])
        .order('created_at', { ascending: false })

    if (error) {
        throw error
    }

    return data ?? []
}

export async function fetchPendingEnrollmentsByCourseId(courseId: string) {
    if (!courseId) {
        throw new Error('Course ID is required.')
    }

    const { data, error } = await supabase
        .from(DatabaseTableName.enrollmentsCollection)
        .select()
        .eq('course_id', courseId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

    if (error) throw error

    return data ?? []
}

export async function fetchPendingEnrollmentsByOrganization(
    userId: string,
) {
    const { data: organization, error: organizationError } =
        await supabase
            .from('organizations')
            .select('id')
            .eq('owner_id', userId)
            .single()

    if (organizationError) throw organizationError

    if (!organization) {
        throw new Error('Organization tidak ditemukan.')
    }

    const { data: courses, error: courseError } =
        await supabase
            .from('courses')
            .select('id')
            .eq('organization_id', organization.id)

    if (courseError) throw courseError

    const courseIds = courses?.map(course => course.id) ?? []

    if (courseIds.length === 0) return []

    const { data: enrollments, error: enrollmentError } =
        await supabase
            .from('enrollments')
            .select('*')
            .in('course_id', courseIds)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })

    if (enrollmentError) throw enrollmentError

    return enrollments ?? []
}

export async function approveEnrollment(enrollmentId: string) {
    if (!enrollmentId) {
        throw new Error('Enrollment ID is required.')
    }

    const { error } = await supabase.rpc('approve_enrollment', {
        p_enrollment_id: enrollmentId,
    })

    if (error) throw error

    return true
}

export async function rejectEnrollment(enrollmentId: string, reason: string) {
    if (!enrollmentId) {
        throw new Error('Enrollment ID is required.')
    }

    const normalizedReason = reason?.trim()

    if (!normalizedReason) {
        throw new Error('Rejection reason is required.')
    }

    const { error } = await supabase.rpc('reject_enrollment', {
        p_enrollment_id: enrollmentId,
        p_reason: normalizedReason,
    })

    if (error) throw error

    return true
}