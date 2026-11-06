import { DatabaseTableName } from "@/constant/database_table_name";
import { supabase } from "@/lib/supabase";
import { Course, CreateCourseInput, UpdateCourseInput } from "@/types/course_type";

export async function getAllCourseData(): Promise<Course[]> {
    const { data, error } = await supabase.from(DatabaseTableName.coursesCollection).select().order('created_at', { ascending: false })

    if (error) {
        throw error
    }

    return data
}

export async function getCourseForLandingPreview(): Promise<Course[]> {
    const { data, error } = await supabase.from(DatabaseTableName.coursesCollection).select().limit(6).order('created_at', { ascending: false })

    if (error) {
        throw error
    }

    return data
}

// GET MY COURSES
export async function fetchMyCourses(): Promise<Course[]> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw authError;
  if (!user) throw new Error("User belum login");

  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data ?? [];
}

export async function fetchCourseById(courseId: string): Promise<Course> {
    const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .maybeSingle();

    if (error) throw error;

    if (!data) {
        throw new Error("Course not found.");
    }

    return data;
}

// ADD COURSE
export async function addCourse({
    name,
    description,
    organization_id,
    address
}: CreateCourseInput) {
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
        throw authError;
    }

    if (!user) {
        throw new Error("User belum login");
    }

    const { data, error } = await supabase
        .from(DatabaseTableName.coursesCollection)
        .insert({
            owner_id: user.id,
            name,
            description,
            organization_id: organization_id,
            address,
        })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}

// UPDATE COURSE
export async function updateCourse({
    id,
    name,
    description,
    address,
}: UpdateCourseInput) {
    const { data, error } = await supabase
        .from(DatabaseTableName.coursesCollection)
        .update({
            name,
            description,
            address,
        })
        .eq("id", id)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}

// DELETE COURSE
export async function deleteCourse(courseId: string) {
    const { error } = await supabase
        .from(DatabaseTableName.coursesCollection)
        .delete()
        .eq("id", courseId);

    if (error) {
        throw error;
    }
}