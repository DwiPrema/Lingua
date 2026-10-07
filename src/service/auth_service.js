import { supabase } from "@/lib/supabase";

export async function signUp(email, userFullname, UserNickname, UserPhone, UserRole) {
    const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            shouldCreateUser: true,
            data: {
                fullname: userFullname, nickname: UserNickname, phone: UserPhone, role: UserRole
            }
        }
    })

    if (error) {
        console.log(error)
        throw error.message
    }

    return data
}

export async function verifyOtp(email, token) {
    const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
    })

    if (error) throw error

    return data
}

export async function getSession() {
    const { data, error } = await supabase.auth.getSession()

    if (error) throw error

    return data.session
}

export async function getUser() {
    const { data, error } = await supabase.auth.getUser()

    if (error) throw error

    return data.user
}