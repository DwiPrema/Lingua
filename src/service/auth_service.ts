import { supabase } from "@/lib/supabase"
import type { Session, User as SupabaseUser } from "@supabase/supabase-js"

export async function signUp(
    email: string,
    password: string,
    fullname: string,
    nickname: string,
    phoneNumber: string,
    role: string
) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                fullname,
                nickname,
                phone: phoneNumber,
                role,
            },
        },
    })

    if (error) throw error
    return data
}

export async function verifyOtp(email: string, token: string) {
    const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "email",
    })

    if (error) throw error
    return data
}

export async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
}

export async function signInWithEmailPassword(userEmail: string, userPassword: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: userPassword,
    })

    if (error) throw error
    return data
}

export async function signInWithEmailOtp(userEmail: string) {
    const { data, error } = await supabase.auth.signInWithOtp({
        email: userEmail,
        options: {
            shouldCreateUser: false,
        },
    })

    if (error) throw error
    return data
}

export async function getSession(): Promise<Session | null> {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return data.session
}

export function onAuthStateChange(
    callback: (event: string, session: Session | null) => void
) {
    return supabase.auth.onAuthStateChange(callback)
}

export async function getUser(): Promise<SupabaseUser | null> {
    const { data, error } = await supabase.auth.getUser()
    if (error) throw error
    return data.user
}

export async function resendOtp(userEmail: string, type: any = "signup") {
    const { data, error } = await supabase.auth.resend({
        email: userEmail.trim(),
        type,
    })

    if (error) throw error
    return data
}

export const currentUser = supabase.auth.getUser()