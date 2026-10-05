import { supabase } from "@/lib/supabase";

export async function signUp(email) {
    const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            shouldCreateUser: true
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