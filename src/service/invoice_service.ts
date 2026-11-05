
import { DatabaseTableName } from "@/constant/database_table_name";
import { supabase } from "@/lib/supabase";
import type { Invoice } from "@/types/invoice_type";

// =====================================================
// Fetch invoice by ID
// =====================================================

export async function fetchInvoiceById(
    invoiceId: string,
): Promise<Invoice | null> {
    if (!invoiceId) {
        throw new Error("Invoice ID is required.");
    }

    const { data, error } = await supabase
        .from(DatabaseTableName.invoicesCollection)
        .select()
        .eq("id", invoiceId)
        .maybeSingle();

    if (error) throw error;

    return data as Invoice | null;
}

// =====================================================
// Fetch invoices belonging to the current student
// =====================================================

export async function fetchMyInvoices(): Promise<Invoice[]> {
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError) throw authError;

    if (!user) {
        throw new Error("User is not authenticated.");
    }

    const { data: enrollments, error: enrollmentError } =
        await supabase
            .from(DatabaseTableName.enrollmentsCollection)
            .select("id")
            .eq("student_id", user.id);

    if (enrollmentError) throw enrollmentError;

    if (!enrollments || enrollments.length === 0) {
        return [];
    }

    const enrollmentIds = enrollments.map(
        (enrollment) => enrollment.id,
    );

    const { data, error } = await supabase
        .from(DatabaseTableName.invoicesCollection)
        .select()
        .in("enrollment_id", enrollmentIds)
        .order("created_at", { ascending: false });

    if (error) throw error;

    return (data ?? []) as Invoice[];
}

// =====================================================
// Fetch invoices belonging to a course
// =====================================================

export async function fetchInvoicesByCourseId(
    courseId: string,
): Promise<Invoice[]> {
    if (!courseId) {
        throw new Error("Course ID is required.");
    }

    const { data: enrollments, error: enrollmentError } =
        await supabase
            .from(DatabaseTableName.enrollmentsCollection)
            .select("id")
            .eq("course_id", courseId);

    if (enrollmentError) throw enrollmentError;

    if (!enrollments || enrollments.length === 0) {
        return [];
    }

    const enrollmentIds = enrollments.map(
        (enrollment) => enrollment.id,
    );

    const { data, error } = await supabase
        .from(DatabaseTableName.invoicesCollection)
        .select()
        .in("enrollment_id", enrollmentIds)
        .order("created_at", { ascending: false });

    if (error) throw error;

    return (data ?? []) as Invoice[];
}

// Fetch invoice by enrollment ID
export async function fetchInvoiceByEnrollmentId(
    enrollmentId: string
): Promise<Invoice | null> {
    if (!enrollmentId) {
        throw new Error("Enrollment ID is required.");
    }

    const { data, error } = await supabase
        .from(DatabaseTableName.invoicesCollection)
        .select("*")
        .eq("enrollment_id", enrollmentId)
        .eq("invoice_type", "initial")
        .maybeSingle();

    if (error) throw error;

    return data as Invoice | null;
}