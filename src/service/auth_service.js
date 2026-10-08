import { supabase } from "@/lib/supabase";

export async function signUp(
    email,
    password,
    fullname,
    nickname,
    phoneNumber,
    role
) {
    const { data, error } =
        await supabase.auth.signUp({
            email,
            password,

            options: {
                data: {
                    fullname: fullname,
                    nickname: nickname,
                    phone: phoneNumber,
                    role: role,
                },
            },
        });

    if (error) {
        throw error;
    }

    return data;
}

export async function verifyOtp(
    email,
    token
) {
    const { data, error } =
        await supabase.auth.verifyOtp({
            email,
            token,
            type: "email",
        });

    if (error) {
        throw error;
    }

    return data;
}

export async function signOut() {
    const { error } =
        await supabase.auth.signOut();

    if (error) {
        throw error;
    }
}

export async function signInWithEmailPassword(userEmail, userPassword) {
    const {data, error} = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: userPassword
    })

    if(error) {
        throw error;
    }

    return data;
}

export async function signInWithEmailOtp(userEmail) {
    const {data, error} = await supabase.auth.signInWithOtp({
        email: userEmail,
        options: {
            shouldCreateUser: false,
        }
    })

    if(error) {
        throw error
    }

    return data
}

export async function getSession() {
    const {
        data,
        error,
    } = await supabase.auth.getSession();

    if (error) {
        throw error;
    }

    return data.session;
}

export function onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(
        callback
    );
}

export async function getUser() {
    const {
        data,
        error,
    } = await supabase.auth.getUser()

    if (error) {
        throw error
    }

    return data.user
}

export const currentUser =
    supabase.auth.currentUser;